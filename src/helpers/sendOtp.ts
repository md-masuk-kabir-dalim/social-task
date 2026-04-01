import generateOtp from "./generateOtp";
import { jwtHelpers } from "../utils/jwtHelpers";
import { OtpModel, OtpType } from "../app/modules/Auth/otp.model";
import { otpEmail } from "../emails/otpEmail";
import emailSender from "./emailSender";

const sendOtp = async (
  email: string,
  type: OtpType,
  fullName: string,
  userId: string,
  access_secret: string,
  access_expires_in: string,
  subject: string,
) => {
  const { otp, expiry } = generateOtp();

  await OtpModel.findOneAndUpdate(
    { identifier: email },
    { otpCode: otp, expiresAt: expiry, type, userId },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // send email
  emailSender(subject, email, otpEmail(fullName, otp));

  // Generate JWT token
  const otpToken = jwtHelpers.generateToken(
    { id: userId, email, type: type },
    access_secret,
    access_expires_in,
  );

  return {
    otpToken,
  };
};

export default sendOtp;
