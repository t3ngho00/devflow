import { Schema, model, Types, models } from "mongoose";

export interface IVote {
  author: Types.ObjectId;
  id: Types.ObjectId;
  type: "Question" | "Answer";
  voteType: "upvote" | "downvote";
  timestamp: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    id: {
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

const Vote = models.Vote || model<IVote>("Vote", VoteSchema);
export default Vote;
