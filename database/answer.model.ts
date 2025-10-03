import { Schema, model, Types, models } from "mongoose";

export interface IAnswer {
  author: Types.ObjectId;
  content: string;
  question: Types.ObjectId;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Answer = models.Answer || model<IAnswer>("Answer", AnswerSchema);
export default Answer;
