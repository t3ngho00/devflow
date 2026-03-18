"use server";

import { FilterQuery, PipelineStage, Types } from "mongoose";

import { Answer, Question, User } from "@/database";

import prepareActionContext from "../handlers/action";
import handleError from "../handlers/error";
import { assignBadges, toPlainObject } from "../utils";
import {
  GetUserQuestionsSchema,
  GetUsersAnswersSchema,
  GetUserTagsSchema,
  GetUserWithStatsSchema,
  PaginatedSearchParamsSchema,
} from "../validation";

export async function getUsers(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ users: User[]; isNext: boolean }>> {
  const validationResult = await prepareActionContext({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { page = 1, pageSize = 10, query, sort } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: FilterQuery<typeof User> = {};

  if (query) {
    filterQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  let sortCriteria = {};
  switch (sort) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { reputation: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalUsers = await User.countDocuments(filterQuery);

    const users = await User.find(filterQuery)
      .lean<User[]>()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: { users: toPlainObject(users), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUser(params: GetUserParams): Promise<
  ActionResponse<{
    user: User;
  }>
> {
  const validationResult = await prepareActionContext({
    params,
    schema: GetUserWithStatsSchema,
  });
  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { userId } = params;

  try {
    const user = await User.findById(userId).lean<User>();

    if (!user) return handleError(new Error("User not found")) as ErrorResponse;

    return {
      success: true,
      data: {
        user: toPlainObject(user),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserQuestions(params: GetUserQuestionsParams): Promise<
  ActionResponse<{
    questions: Question[];
    isNext: boolean;
  }>
> {
  const validationResult = await prepareActionContext({
    params,
    schema: GetUserQuestionsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  try {
    const user = await User.findById(userId).lean<User>();
    if (!user) return handleError(new Error("User not found")) as ErrorResponse;

    const totalQuestions = await Question.countDocuments({ author: userId });

    const questions = await Question.find({ author: userId })
      .populate("tags", "name")
      .populate("author", "name image")
      .skip(skip)
      .limit(limit)
      .lean<Question[]>();

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        questions: toPlainObject(questions),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUsersAnswers(
  params: GetUserAnswersParams
): Promise<ActionResponse<{ answers: Answer[]; isNext: boolean }>> {
  const validationResult = await prepareActionContext({
    params,
    schema: GetUsersAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  try {
    const totalAnswers = await Answer.countDocuments({ author: userId });
    const answers = await Answer.find({ author: userId })
      .populate("author", "_id name image")
      .skip(skip)
      .limit(limit)
      .lean<Answer[]>();

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers: toPlainObject(answers),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserTopTags(
  params: GetUserTagsParams
): Promise<
  ActionResponse<{ tags: { _id: string; name: string; count: number }[] }>
> {
  const validationResult = await prepareActionContext({
    params,
    schema: GetUserTagsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = params;

  try {
    const pipeline: PipelineStage[] = [
      { $match: { author: new Types.ObjectId(userId) } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "tags",
          localField: "_id",
          foreignField: "_id",
          as: "tagInfo",
        },
      },
      { $unwind: "$tagInfo" },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: "$tagInfo._id",
          name: "$tagInfo.name",
          count: 1,
        },
      },
    ];

    const tags = await Question.aggregate(pipeline);

    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserStats(params: GetUserStatsParams): Promise<
  ActionResponse<{
    totalQuestions: number;
    totalAnswers: number;
    badgeCounts: BadgeCounts;
  }>
> {
  const validationResult = await prepareActionContext({
    params,
    schema: GetUserWithStatsSchema,
  });
  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { userId } = params;

  try {
    const user = await User.findById(userId).lean<User>();

    if (!user) return handleError(new Error("User not found")) as ErrorResponse;

    const [questionStats] = await Question.aggregate([
      { $match: { author: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: "$upvotes" },
          views: { $sum: "$views" },
        },
      },
    ]);

    const [answerStats] = await Answer.aggregate([
      { $match: { author: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: "$upvotes" },
        },
      },
    ]);

    const badgeCounts = assignBadges({
      criteria: [
        { type: "ANSWER_COUNT", count: answerStats.count },
        { type: "QUESTION_COUNT", count: questionStats.count },
        {
          type: "QUESTION_UPVOTES",
          count: questionStats.upvotes + answerStats.upvotes,
        },
        { type: "TOTAL_VIEWS", count: questionStats.views },
      ],
    });
    return {
      success: true,
      data: {
        totalQuestions: questionStats.count,
        totalAnswers: answerStats.count,
        badgeCounts,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
