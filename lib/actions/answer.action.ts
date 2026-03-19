"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import ROUTES from "@/constants/ROUTES";
import { Question, Vote } from "@/database";
import Answer, { IAnswerDoc } from "@/database/answer.model";

import prepareActionContext from "../handlers/action";
import handleError from "../handlers/error";
import { toPlainObject } from "../utils";
import {
  AnswerServerSchema,
  DeleteAnswerSchema,
  GetAnswersSchema,
} from "../validation";
import { createInteraction } from "./interaction.action";

export async function getAnswers(params: GetAnswersParams): Promise<
  ActionResponse<{
    answers: Answer[];
    isNext: boolean;
    totalAnswers: number;
  }>
> {
  const validationResult = await prepareActionContext({
    params,
    schema: GetAnswersSchema,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { questionId, page = 1, pageSize = 10, sort } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  let sortCriteria = {};
  switch (sort) {
    case "lastest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;

    case "popular":
      sortCriteria = { upvotes: -1 };
      break;

    default:
      sortCriteria = { upvotes: -1 };
      break;
  }

  try {
    const [totalAnswers, answers] = await Promise.all([
      Answer.countDocuments({ question: questionId }),
      Answer.find({ question: questionId })
        .populate("author", "_id name image")
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean<Answer[]>(),
    ]);

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers,
        isNext,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createAnswer(
  params: CreateAnswerParams
): Promise<ActionResponse<IAnswerDoc>> {
  const validationResult = await prepareActionContext({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, questionId } = validationResult.params!;
  const userId = validationResult.session!.user!.id;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const question = await Question.findById(questionId);

    if (!question) throw new Error("Question not found");

    const [newAnswer] = await Answer.create(
      [{ question: questionId, content, author: userId }],
      { session }
    );

    if (!newAnswer) throw new Error("Failed to create answer");

    question.answers += 1;
    await question.save({ session });

    after(async () => {
      await createInteraction({
        action: "post",
        targetId: newAnswer._id.toString(),
        targetType: "answer",
        targetAuthorId: userId as string,
      });
    });

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: toPlainObject(newAnswer),
      status: 201,
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function deleteAnswer(
  params: DeleteAnswerParams
): Promise<ActionResponse> {
  const validationResult = await prepareActionContext({
    params,
    schema: DeleteAnswerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { answerId } = validationResult.params!;
  const { user } = validationResult.session!;

  try {
    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error("Answer not found");

    if (answer.author.toString() !== user?.id)
      throw new Error("You're not allowed to delete this answer");

    // reduce the question answers count
    await Question.findByIdAndUpdate(
      answer.question,
      { $inc: { answers: -1 } },
      { new: true }
    );

    // delete votes associated with answer
    await Vote.deleteMany({ actionId: answerId, actionType: "answer" });

    // delete the answer
    await Answer.findByIdAndDelete(answerId);

    revalidatePath(`/profile/${user?.id}`);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
