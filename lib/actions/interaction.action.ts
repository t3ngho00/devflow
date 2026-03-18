import mongoose from "mongoose";

import { User } from "@/database";
import Interaction, { IInteractionDoc } from "@/database/interaction.model";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { CreateInteractionSchema } from "../validation";

export async function createInteraction(
  params: CreateInteractionParams
): Promise<ActionResponse<IInteractionDoc>> {
  const validationResult = await action({
    params,
    schema: CreateInteractionSchema,
    authorize: true,
  });
  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const {
    action: interactionAction,
    targetId,
    targetType,
    targetAuthorId,
  } = validationResult.params!;
  const actorId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [interaction] = await Interaction.create(
      [
        {
          actorId,
          action: interactionAction,
          targetId,
          targetType,
          targetAuthorId,
        },
      ],
      { session }
    );

    await updateReputation({
      interaction,
      session,
      actorId: actorId!,
      targetAuthorId,
    });

    await session.commitTransaction();
    return { success: true, data: JSON.parse(JSON.stringify(interaction)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

async function updateReputation(params: UpdateReputationParams) {
  const { interaction, session, actorId, targetAuthorId } = params;
  const { action, targetType } = interaction;

  let performerPoints = 0;
  let authorPoints = 0;

  switch (action) {
    case "upvote":
      performerPoints = 2;
      authorPoints = 10;
      break;
    case "downvote":
      performerPoints = -1;
      authorPoints = -2;
      break;
    case "post":
      authorPoints = targetType === "question" ? 5 : 10;
      break;
    case "delete":
      authorPoints = targetType === "question" ? -5 : -10;
      break;
  }

  if (actorId === targetAuthorId) {
    await User.findByIdAndUpdate(
      actorId,
      { $inc: { reputation: authorPoints } },
      { session }
    );

    return;
  }

  await User.bulkWrite(
    [
      {
        updateOne: {
          filter: { _id: actorId },
          update: { $inc: { reputation: performerPoints } },
        },
      },
      {
        updateOne: {
          filter: { _id: targetAuthorId },
          update: { $inc: { reputation: authorPoints } },
        },
      },
    ],
    { session }
  );
}
