import { Document, Types } from "mongoose";
import { IPost } from "./post.interface";
import { PostModel } from "./post.model";
import { searchPaginate } from "../../../helpers/searchAndPaginate";

const createPost = async (postData: Partial<IPost>): Promise<IPost> => {
  const post = await PostModel.create(postData);
  return post;
};

const getPostById = async (postId: string): Promise<IPost | null> => {
  const post = await PostModel.findById(postId)
    .populate("author", "name email")
    .populate("likesCount")
    .populate("commentsCount")
    .populate({
      path: "comments",
      populate: { path: "author", select: "name email" },
    });
  return post;
};

const updatePost = async (
  postId: string,
  updateData: Partial<IPost>,
): Promise<IPost | null> => {
  const post = await PostModel.findByIdAndUpdate(postId, updateData, {
    new: true,
  });
  return post;
};

const deletePost = async (postId: string): Promise<IPost | null> => {
  const post = await PostModel.findByIdAndDelete(postId);
  return post;
};

const getPostsForFeed = async (
  userId: string,
  page = 1,
  limit = 10,
  searchText = "",
) => {
  const filters = {
    $or: [
      { author: new Types.ObjectId(userId) },
      { author: { $ne: new Types.ObjectId(userId) }, policy: "PUBLISH" },
    ],
  };

  const result = await searchPaginate<IPost>({
    model: PostModel,
    searchFields: ["content"] as (keyof IPost)[],
    search: searchText,
    filters,
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
    populate: [
      { path: "author", select: "name email avatar" },
      { path: "likesCount" },
      { path: "commentsCount" },
      { path: "comments" },
    ],
    skipCount: false,
  });

  return result;
};

export const PostService = {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getPostsForFeed,
};
