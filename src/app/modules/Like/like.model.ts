import { Schema, model } from "mongoose";
import { ILike } from "./like.interface";

const LikeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    reply: { type: Schema.Types.ObjectId, ref: "Reply" },
    type: { type: String, enum: ["like", "dislike"], default: "like" },
  },
  { timestamps: true },
);

// -------------------
// Indexes to prevent double-like
// -------------------
LikeSchema.index(
  { user: 1, post: 1 },
  { unique: true, partialFilterExpression: { post: { $exists: true } } },
);

LikeSchema.index(
  { user: 1, comment: 1 },
  { unique: true, partialFilterExpression: { comment: { $exists: true } } },
);

LikeSchema.index(
  { user: 1, reply: 1 },
  { unique: true, partialFilterExpression: { reply: { $exists: true } } },
);

export const LikeModel = model<ILike>("Like", LikeSchema);
