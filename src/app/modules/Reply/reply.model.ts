import { Schema, model } from "mongoose";
import { IReply } from "./reply.interface";

const ReplySchema = new Schema<IReply>(
  {
    comment: { type: Schema.Types.ObjectId, ref: "Comment", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// -------------------
// Virtuals
// -------------------

// Total likes for reply
ReplySchema.virtual("likesCount", {
  ref: "Like",
  localField: "_id",
  foreignField: "reply",
  count: true,
});

export const ReplyModel = model<IReply>("Reply", ReplySchema);
