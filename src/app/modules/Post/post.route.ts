import { Router } from "express";
import { PostController } from "./post.controller";
import auth from "../../middlewares/auth";

const router = Router();
router.post("/", auth(), PostController.createPost);
router.get("/:id", auth(), PostController.getPostById);
router.patch("/:id", auth(), PostController.updatePost);
router.delete("/:id", auth(), PostController.deletePost);
router.get("/feed", auth(), PostController.getPostsForFeed);

export const PostRoutes = router;
