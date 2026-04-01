import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./user.service";
import { UserRole, UserStatus } from "./user.model";

// ------------------------------ UPDATE USER CONTROLLER ------------------------------
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const payload = req.body;

  const updatedUser = await UserService.updateUser(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const sortBy = req.query.sortBy as string | undefined;
  const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";
  const role = req.query.role as UserRole | undefined;
  const status = req.query.status as UserStatus | undefined;
  const searchTerm = req.query.searchTerm as string | undefined;

  const filters = { role, status, searchTerm };

  const paginationOptions = { page, limit, sortBy, sortOrder };

  const result = await UserService.getUsers(paginationOptions, filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await UserService.getUserById(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  await UserService.deleteUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User account deleted successfully",
  });
});

export const UserController = {
  updateUser,
  getUsers,
  getUserById,
  deleteUser,
};
