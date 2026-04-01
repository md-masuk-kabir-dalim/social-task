import { Types } from "mongoose";
import { OtpType } from "./otp.model";

export interface IOtp extends Document {
  identifier: string;
  otpCode: string;
  userId: Types.ObjectId;
  type: OtpType;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
