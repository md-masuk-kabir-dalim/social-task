import { Document, Types } from "mongoose";
import { UserRole, UserStatus } from "./user.model";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNo?: string;
  image?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  isVerified: boolean;
  tokenVersion: number;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}
