import { Schema, models, model, Document, Types } from "mongoose";

import { InteractionActionEnums } from "@/constants/interaction";

export interface IInteraction {
  actorId: Types.ObjectId;
  action: string;
  targetId: Types.ObjectId;
  targetType: "question" | "answer";
  targetAuthorId: Types.ObjectId;
  voteType?: "upvote" | "downvote";
}

export interface IInteractionDoc extends IInteraction, Document {}

const InteractionSchema = new Schema<IInteraction>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, enum: InteractionActionEnums },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["question", "answer"],
      required: true,
    },
    targetAuthorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voteType: {
      type: String,
      enum: ["upvote", "downvote"],
    },
  },
  { timestamps: true }
);

const Interaction =
  models?.Interaction || model<IInteraction>("Interaction", InteractionSchema);

export { InteractionActionEnums };
export default Interaction;
