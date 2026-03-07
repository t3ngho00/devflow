"use server";

import mongoose, { PipelineStage } from "mongoose";
import { revalidatePath } from "next/cache";

import QuestionDetails from "@/app/(root)/questions/[id]/page";
import ROUTES from "@/constants/ROUTES";
import { Collection, Question } from "@/database";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  CollectionBaseSchema,
  PaginatedSearchParamsSchema,
} from "../validation";

export async function toggleSaveQuestion(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const question = await Question.exists({ _id: questionId });
    if (!question) throw new Error("Question not found");

    const collection = await Collection.findOne({
      author: userId,
      question: questionId,
    });

    if (collection) {
      await Collection.deleteOne({ _id: collection._id });
    } else {
      await Collection.create({ author: userId, question: questionId });
    }

    revalidatePath(ROUTES.QUESTION(questionId));

    return { success: true, data: { saved: !collection } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function hasSavedQuestion(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const collection = await Collection.findOne({
      question: questionId,
      author: userId,
    });

    return {
      success: true,
      data: {
        saved: !!collection,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSavedQuestion(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ collection: Collection[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;
  const userId = validationResult.session?.user?.id;
  const { page = 1, pageSize = 10, query, sort } = params;

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  const sortOptions: Record<string, Record<string, 1 | -1>> = {
    mostrecent: { "question.createdAt": -1 },
    oldest: { "question.createdAt": 1 },
    mostvoted: { "question.upvotes": -1 },
    mostviewed: { "question.views": -1 },
    mostanswered: { "question.answers": -1 },
  };

  const sortCriteria = sortOptions[sort as keyof typeof sortOptions] || {
    "question.createdAt": -1,
  };

  try {
    const pipeline: PipelineStage[] = [
      // Step 1: Match the author (filter by userId)
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
        },
      },

      // Step 2: If a query is provided, filter the questions based on title/content
      // Filters the questions themselves before doing the lookup
      ...(query
        ? [
            {
              $match: {
                $or: [
                  { "question.title": { $regex: query, $options: "i" } },
                  { "question.content": { $regex: query, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      // Step 3: Lookup `question` data from the `questions` collection
      {
        $lookup: {
          from: "questions",
          localField: "question",
          foreignField: "_id",
          as: "question",
        },
      },

      // Step 4: Unwind the `question` field to flatten the array (if it is an array)
      { $unwind: "$question" },

      // Step 5: Lookup the `author` data from the `users` collection for the question's author
      {
        $lookup: {
          from: "users",
          localField: "question.author",
          foreignField: "_id",
          as: "question.author",
        },
      },
      { $unwind: "$question.author" },

      // Step 6: Lookup the `tags` data from the `tags` collection
      {
        $lookup: {
          from: "tags",
          localField: "question.tags",
          foreignField: "_id",
          as: "question.tags",
        },
      },

      // Step 7: Optional - Apply sorting
      { $sort: sortCriteria },

      // Step 8: Apply pagination
      { $skip: skip },
      { $limit: limit },

      // Step 9: Project the necessary fields (e.g., `question` and `author`)
      { $project: { question: 1, author: 1 } },
    ];

    const [totalCount] = await Collection.aggregate([
      ...pipeline,
      { $count: "count" },
    ]);

    const questions = await Collection.aggregate(pipeline);

    const isNext = totalCount.count > skip + QuestionDetails.length;

    return {
      success: true,
      data: {
        collection: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
