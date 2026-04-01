import { Schema, model } from "mongoose";
import { IOtp } from "./auth.interface";

export enum OtpType {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PHONE_NUMBER_VERIFICATION = "PHONE_NUMBER_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  TWO_FACTO = "TWO_FACTO",
}

const OtpSchema = new Schema<IOtp>(
  {
    identifier: { type: String, required: true },
    otpCode: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, enum: Object.values(OtpType), required: true },

    attempts: { type: Number, default: 0 },

    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = model<IOtp>("Otp", OtpSchema);
