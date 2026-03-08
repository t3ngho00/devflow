"use server";

import mongoose, { PipelineStage } from "mongoose";
import { revalidatePath } from "next/cache";

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
    const filterStages: PipelineStage[] = [
      {
        $match: {
          author: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "questions",
          localField: "question",
          foreignField: "_id",
          as: "question",
        },
      },

      { $unwind: "$question" },

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

      {
        $lookup: {
          from: "users",
          localField: "question.author",
          foreignField: "_id",
          as: "question.author",
        },
      },
      { $unwind: "$question.author" },

      {
        $lookup: {
          from: "tags",
          localField: "question.tags",
          foreignField: "_id",
          as: "question.tags",
        },
      },
    ];

    const [totalCount] = await Collection.aggregate([
      ...filterStages,
      { $count: "count" },
    ]);
    const total = totalCount?.count || 0;

    const questions = await Collection.aggregate([
      ...filterStages,
      { $sort: sortCriteria },
      { $skip: skip },
      { $limit: limit },
      { $project: { question: 1, author: 1 } },
    ]);

    const isNext = total > skip + questions.length;

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
