"use server";

import mongoose, { ClientSession } from "mongoose";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import ROUTES from "@/constants/ROUTES";
import { Answer, Question, Vote } from "@/database";

import { createInteraction } from "./interaction.action";
import prepareActionContext from "../handlers/action";
import handleError from "../handlers/error";
import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteCountSchema,
} from "../validation";

export async function hasVoted(
  params: HasVotedParams
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await prepareActionContext({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (!vote) {
      return {
        success: false,
        data: { hasUpvoted: false, hasDownvoted: false },
      };
    }

    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvote",
        hasDownvoted: vote.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(
  params: CreateVoteParams
): Promise<ActionResponse> {
  const validationResult = await prepareActionContext({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) return handleError(new Error("Unauthorized")) as ErrorResponse;

  const session = await mongoose.startSession();
  const interactionEvents: CreateInteractionParams[] = [];

  try {
    const Model = targetType === "question" ? Question : Answer;

    const contentDoc = await Model.findById(targetId).session(session);
    if (!contentDoc) throw new Error("Content not found");

    const targetAuthorId = contentDoc.author.toString();

    session.startTransaction();
    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    }).session(session);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // If the user has already voted with the same voteType, remove the vote
        await Vote.deleteOne({ _id: existingVote._id }).session(session);
        await updateVoteCount(
          { targetId, targetType, voteType, change: -1 },
          session
        );

        interactionEvents.push({
          action: "removeVote",
          targetId,
          targetType,
          targetAuthorId,
          voteType,
        });
      }
      // If the user has already voted with the *different voteType,
      else {
        const previousVoteType = existingVote.voteType;

        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { new: true, session }
        );

        // remove old vote
        await updateVoteCount(
          { targetId, targetType, voteType: previousVoteType, change: -1 },
          session
        );

        // add new vote
        await updateVoteCount(
          { targetId, targetType, voteType, change: 1 },
          session
        );

        interactionEvents.push({
          action: "removeVote",
          targetId,
          targetType,
          targetAuthorId,
          voteType: previousVoteType,
        });

        interactionEvents.push({
          action: voteType,
          targetId,
          targetType,
          targetAuthorId,
          voteType,
        });
      }
    } else {
      // If the user has not voted yet, create a new vote
      await Vote.create(
        [
          {
            author: userId,
            actionId: targetId,
            actionType: targetType,
            voteType,
          },
        ],
        {
          session,
        }
      );
      await updateVoteCount(
        { targetId, targetType, voteType, change: 1 },
        session
      );

      interactionEvents.push({
        action: voteType,
        targetId,
        targetType,
        targetAuthorId,
        voteType,
      });
    }

    await session.commitTransaction();

    if (interactionEvents.length > 0) {
      after(async () => {
        for (const interactionEvent of interactionEvents) {
          await createInteraction(interactionEvent);
        }
      });
    }

    session.endSession();
    revalidatePath(ROUTES.QUESTION(targetId));

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return handleError(error) as ErrorResponse;
  }
}

export async function updateVoteCount(
  params: UpdateVoteCountParams,
  session?: ClientSession
): Promise<ActionResponse> {
  const validationResult = await prepareActionContext({
    params,
    schema: UpdateVoteCountSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType, change } = validationResult.params!;

  const Model = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";

  try {
    const result = await Model.findByIdAndUpdate(
      targetId,
      { $inc: { [voteField]: change } },
      { new: true, session }
    );

    if (!result)
      return handleError(
        new Error("Failed to update vote count")
      ) as ErrorResponse;

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
