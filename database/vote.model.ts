import { Schema, models, model, Document, Types } from "mongoose";

export interface IVote {
  author: Types.ObjectId;
  actionId: Types.ObjectId;
  type: "Question" | "Answer";
  voteType: "upvote" | "downvote";
}

export interface IVoteDoc extends IVote, Document {}

const VoteSchema = new Schema<IVote>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actionId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "type",
    },
    type: {
      type: String,
      enum: ["Question", "Answer"],
      required: true,
    },
    voteType: { type: String, enum: ["upvote", "downvote"], required: true },
  },
  { timestamps: true }
);

const Vote = models?.Vote || model<IVote>("Vote", VoteSchema);
export default Vote;
