"use server";

import { FilterQuery } from "mongoose";

import { Answer, Question, User as UserModel } from "@/database";

import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  GetUserWithStatsSchema,
  PaginatedSearchParamsSchema,
} from "../validation";

export async function getUsers(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ users: User[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { page = 1, pageSize = 10, query, sort } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  const filterQuery: FilterQuery<typeof UserModel> = {};

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
    const totalUsers = await UserModel.countDocuments(filterQuery);

    const users = await UserModel.find(filterQuery)
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: { users: JSON.parse(JSON.stringify(users)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUser(params: GetUserWithStatsParams): Promise<
  ActionResponse<{
    user: User;
    totalQuestions: number;
    totalAnswers: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetUserWithStatsSchema,
  });
  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { userId } = params;

  try {
    const user = await UserModel.findById(userId).lean<User>();

    if (!user) return handleError(new Error("User not found")) as ErrorResponse;

    const totalQuestions = await Question.countDocuments({ author: userId });
    const totalAnswers = await Answer.countDocuments({ author: userId });

    return {
      success: true,
      data: {
        user,
        totalQuestions,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
