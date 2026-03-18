"use server";
import mongoose, { FilterQuery } from "mongoose";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { Answer, Collection, Vote } from "@/database";
import Question, { IQuestionDoc } from "@/database/question.model";
import TagQuestion from "@/database/tag-question.model";
import Tag, { ITagDoc } from "@/database/tag.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { UnauthorizedError } from "../http-errors";
import dbConnect from "../mongoose";
import { toPlainObject } from "../utils";
import {
  AskQuestionSchema,
  DeleteQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<Question>> {
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

  // Start a database transaction to ensure data integrity
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // 1. Create the question document
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session }
    );

    if (!question) throw new Error("Failed to create question");

    // 2. Process tags: Find existing tags or create new ones
    const tagIds: mongoose.Types.ObjectId[] = [];
    const newTagQuestionDocuments = [];

    for (const tag of tags) {
      // Upsert tag: Update if exists, Insert if not
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, new: true, session }
      );

      tagIds.push(existingTag._id);
      // Prepare relationship document
      newTagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    // 3. Update the question with the tag references
    await Question.findByIdAndUpdate(
      question._id,
      { $push: { tags: { $each: tagIds } } },
      { session }
    );

    // 4. Create the Tag-Question relationships (if you have a separate collection for this)
    // await TagQuestion.insertMany(newTagQuestionDocuments, { session });

    await session.commitTransaction();

    return {
      success: true,
      data: toPlainObject(question),
      status: 201,
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function editQuestion(
  params: EditQuestionParams
): Promise<ActionResponse<IQuestionDoc>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = params;
  const userId = validationResult.session!.user!.id;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // 1. Fetch the question and populate tags
    const question = await Question.findById(questionId).populate("tags");

    if (!question) {
      throw new Error("Question not found");
    }

    // 2. Check authorization
    if (question.author.toString() !== userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    // 3. Update basic fields if changed
    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    // 4. Calculate tags to add and remove
    const tagsToAdd = tags.filter(
      (tag) =>
        !question.tags.some(
          (t: ITagDoc) => t.name.toLowerCase() === tag.toLowerCase()
        )
    );

    const tagsToRemove = question.tags.filter(
      (tag: ITagDoc) => !tags.includes(tag.name.toLowerCase())
    );

    const newTagQuestionDocuments = [];

    // 5. Process new tags
    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        // Upsert tag
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: `^${tag}$`, $options: "i" } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        );

        if (existingTag) {
          newTagQuestionDocuments.push({
            tag: existingTag._id,
            question: questionId,
          });

          question.tags.push(existingTag._id);
        }
      }
    }

    // 6. Insert new Tag-Question relationships
    if (newTagQuestionDocuments.length > 0) {
      await TagQuestion.insertMany(newTagQuestionDocuments, { session });
    }

    // 7. Process removed tags
    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITagDoc) => tag._id);

      // Decrement question count for removed tags
      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { questions: -1 } },
        { session }
      );

      // Remove Tag-Question relationships
      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: questionId },
        { session }
      );

      // Update question's tags array
      question.tags = question.tags.filter((tag: ITagDoc) => {
        const tagId = (tag._id ?? tag) as mongoose.Types.ObjectId | string;
        return !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
          id.equals(String(tagId))
        );
      });
    }

    await question.save({ session });
    await session.commitTransaction();

    return {
      success: true,
      data: toPlainObject(question),
      status: 200,
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getQuestion(
  params: GetQuestionParams
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId)
      .populate("tags")
      .populate("author", "_id name image")
      .lean<Question>();

    if (!question) {
      throw new Error("Question not found");
    }

    return { success: true, data: toPlainObject(question) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof ZodError) {
    return handleError(validationResult) as ErrorResponse;
  }

  // basic page options
  const { page = 1, pageSize = 10, query, sort } = params;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  // filter
  const filterQuery: FilterQuery<typeof Question> = {};

  // skipping the recommended sort for now, will implement later when we track users
  if (sort === "recommended") {
    return { success: true, data: { questions: [], isNext: false } };
  }

  // query (case insensitive)
  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } },
    ];
  }

  // sort
  let sortCriteria = {};

  switch (sort) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    case "unanswered":
      filterQuery.answers = 0;
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean<Question[]>()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: { questions: toPlainObject(questions), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function incrementViews(
  params: IncrementViewsParams
): Promise<ActionResponse<{ views: number }>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { questionId } = validationResult.params!;
  try {
    const question = await Question.findById(questionId);

    if (!question) throw new Error("Question not found");

    question.views += 1;
    await question.save();

    return { success: true, data: { views: question.views } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getTopQuestions(): Promise<ActionResponse<Question[]>> {
  try {
    await dbConnect();

    const questions = await Question.find()
      .sort({ views: -1, upvotes: -1 })
      .limit(5)
      .lean<Question[]>();
    return {
      success: true,
      data: toPlainObject(questions),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteQuestion(
  params: DeleteQuestionParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const { user } = validationResult.session!;

  // Create a Mongoose Session
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const question = await Question.findById(questionId).session(session);
    if (!question) throw new Error("Question not found");

    if (question.author.toString() !== user?.id)
      throw new Error("You are not authorized to delete this question");

    // Delete references from collection
    await Collection.deleteMany({ question: questionId }).session(session);

    // Delete references from TagQuestion collection
    await TagQuestion.deleteMany({ question: questionId }).session(session);

    // For all tags of Question, find them and reduce their count
    if (question.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: question.tags } },
        { $inc: { questions: -1 } },
        { session }
      );
    }

    // Remove all votes of the question
    await Vote.deleteMany({
      actionId: questionId,
      actionType: "question",
    }).session(session);

    // Remove all answers and their votes of the question
    const answers = await Answer.find({ question: questionId }).session(
      session
    );

    if (answers.length > 0) {
      await Answer.deleteMany({ question: questionId }).session(session);

      await Vote.deleteMany({
        actionId: { $in: answers.map((answer) => answer.id) },
        actionType: "answer",
      }).session(session);
    }

    // Delete question
    await Question.findByIdAndDelete(questionId).session(session);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Revalidate to reflect immediate changes on UI
    revalidatePath(`/profile/${user?.id}`);

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return handleError(error) as ErrorResponse;
  }
}
