import { Types } from "mongoose";

export interface IPost {
  content: string;
  image?: {
    url: string;
    altText: string;
    description?: string;
    publicId: string;
  };
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
