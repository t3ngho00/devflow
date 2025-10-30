"use server"
import mongoose from "mongoose";

import Question from "@/database/question.model";
import Tag from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { AskQuestionSchema } from "../validation";

export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<Question>> {
  console.log("Title:", params.title);
  console.log("Content:", params.content);
  console.log("Tags:", params.tags);

  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = params;
  const userId = validationResult.session!.user!.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // create a question
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session }
    );

    if (!question) throw new Error("Failed to create question");
    // create array to contain tagIds and tagQuestionDocuments
    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocuments = [];

    // loop over the array of tagIds and find the ids of the tags
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, new: true, session }
      );

      tagIds.push(existingTag._id);
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    await Question.findByIdAndUpdate(
      question._id,
      { $push: { tags: { $each: tagIds } } },
      { session }
    );

    await session.commitTransaction();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
      status: 201,
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
