"use server"

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/ROUTES";
import { Question } from "@/database";
import Answer, { IAnswerDoc } from "@/database/answer.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { AnswerServerSchema } from "../validation";

export async function createAnswer(
  params: CreateAnswerParams
): Promise<ActionResponse<IAnswerDoc>> {
  const validationResult = await action({
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
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);

    if (!question) throw new Error("Question not found");

    const [newAnswer] = await Answer.create(
      [{ question: questionId, content, author: userId }],
      { session }
    );

    if (!newAnswer) throw new Error("Failed to create answer");

    question.answers += 1;
    await question.save({ session });

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newAnswer)),
      status: 201,
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
