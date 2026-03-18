import { Schema, models, model, Document, Types } from "mongoose";

export interface IInteraction {
  actorId: Types.ObjectId;
  action: string;
  targetId: Types.ObjectId;
  targetType: "question" | "answer";
  targetAuthorId: Types.ObjectId;
}

export const InteractionActionEnums = [
  "view",
  "upvote",
  "downvote",
  "bookmark",
  "post",
  "edit",
  "delete",
  "search",
] as const;

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
  },
  { timestamps: true }
);

const Interaction =
  models?.Interaction || model<IInteraction>("Interaction", InteractionSchema);

export default Interaction;
