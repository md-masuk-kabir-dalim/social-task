import { Types } from "mongoose";

export interface IComment {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
