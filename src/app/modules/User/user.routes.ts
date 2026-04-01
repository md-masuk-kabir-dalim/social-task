import express from "express";
import auth from "../../middlewares/auth";
import { UserController } from "./user.controller";
import { UserRole } from "./user.model";
const router = express.Router();

router.patch("/update-user", auth(UserRole.USER), UserController.deleteUser);

router.delete("/delete/:id", auth(UserRole.ADMIN), UserController.deleteUser);

router.get("/", auth(UserRole.ADMIN), UserController.getUsers);

router.get("/:id", auth(), UserController.getUserById);

export const UserRoutes = router;
