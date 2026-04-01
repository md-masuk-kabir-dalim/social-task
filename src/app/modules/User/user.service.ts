import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/pagination";
import { IUser } from "./user.interface";
import { UserModel, UserRole, UserStatus } from "./user.model";
import { searchPaginate } from "../../../helpers/searchAndPaginate";

//------------------------------------------ update user ------------------------------------------
const updateUser = async (id: string, payload: Partial<IUser>) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    {
      fullName: payload.fullName,
      phoneNo: payload.phoneNo,
      ...(payload.image && { image: payload.image }),
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return updatedUser;
};

//------------------------------------------ get users ------------------------------------------
const getUsers = async (
  options: IPaginationOptions,
  filters: { role?: UserRole; status?: UserStatus; searchTerm?: string }
) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;
  const { role, status, searchTerm } = filters;

  const appliedFilters: any = {
    role: { $ne: UserRole.ADMIN },
  };

  if (role) appliedFilters.role = role;
  if (status) appliedFilters.status = status;

  const result = await searchPaginate<IUser>({
    model: UserModel,
    search: searchTerm || "",
    searchFields: ["fullName", "email"],
    filters: appliedFilters,
    page,
    limit,
    sortBy,
    sortOrder,
    select:
      "id email phoneNo fullName image role status isVerified createdAt updatedAt",
  });

  return result;
};

//------------------------------------------ get user by ID ------------------------------------------
const getUserById = async (id: string) => {
  const user = await UserModel.findById(id).select(
    "id email phoneNo fullName image role status isVerified createdAt updatedAt"
  );

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

//------------------------------------------ delete user ------------------------------------------
const deleteUser = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.status = UserStatus.DELETED;
  await user.save();
  return;
};

export const UserService = {
  updateUser,
  getUsers,
  getUserById,
  deleteUser,
};
