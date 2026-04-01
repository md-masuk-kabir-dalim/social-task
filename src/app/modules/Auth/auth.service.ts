import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import { jwtHelpers } from "../../../utils/jwtHelpers";
import { comparePassword, hashPassword } from "../../../utils/passwordHelpers";
import { IUser } from "../User/user.interface";
import generateOtp from "../../../helpers/generateOtp";
import { otpEmail } from "../../../emails/otpEmail";
import sendOtp from "../../../helpers/sendOtp";
import { UserModel, UserRole } from "../User/user.model";
import { OtpModel, OtpType } from "./otp.model";
import emailSender from "../../../helpers/emailSender";

// ------------------------------
// CHECK EMAIL EXISTS
// ------------------------------
const checkEmailExists = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (user) throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");
};

// ------------------------------
// REGISTER USER
// ------------------------------
const registerUser = async (payload: IUser) => {
  await checkEmailExists(payload.email);

  const hashed = await hashPassword(payload.password);
  const { otp, expiry } = generateOtp();

  const newUser = new UserModel({
    fullName: payload.fullName,
    email: payload.email,
    password: hashed,
    role: UserRole.USER,
    tokenVersion: 1,
  });

  await newUser.save();

  // Save OTP
  await OtpModel.create({
    otpCode: otp,
    expiresAt: expiry,
    identifier: payload.email,
    type: OtpType.EMAIL_VERIFICATION,
    userId: newUser._id,
  });

  const otpToken = await sendOtp(
    payload.email,
    OtpType.EMAIL_VERIFICATION,
    payload.fullName,
    newUser._id.toString(),
    config.jwt.email_verification_secret,
    config.jwt.otp_expires_in,
    "Verify your email",
  );

  return { message: "OTP sent to email", token: otpToken?.otpToken };
};

// ------------------------------
// VERIFY USER OTP
// ------------------------------
const verifyOtp = async (email: string, otp: string, type: OtpType) => {
  const user = await UserModel.findOne({ email }).populate("otp");

  if (!user) throw new ApiError(404, "User not found");

  const otpRecord = await OtpModel.findOne({ identifier: email, type });

  if (!otpRecord) throw new ApiError(400, "OTP not found");

  if (otpRecord.attempts >= 5)
    throw new ApiError(400, "Maximum OTP attempts exceeded");

  if (otpRecord.otpCode !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, "Invalid OTP");
  }

  if (otpRecord.expiresAt < new Date()) throw new ApiError(400, "OTP expired");

  await OtpModel.deleteMany({ identifier: email });

  user.isVerified = true;

  await user.save();

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role, type },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in,
  );

  return { accessToken, refreshToken };
};

// ------------------------------
// LOGIN USER
// ------------------------------
const loginUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).select("+password");

  if (!user) throw new ApiError(404, "User not found");

  if (user.lockUntil && user.lockUntil > new Date())
    throw new ApiError(400, "Account locked");

  if (user.status === "DELETED")
    throw new ApiError(403, "Your account is deleted");

  const valid = await comparePassword(password, user.password);

  if (!valid) {
    user.loginAttempts++;

    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await user.save();
    throw new ApiError(403, "Wrong password");
  }

  if (!user.isVerified) {
    const { otp, expiry } = generateOtp();

    await OtpModel.findOneAndUpdate(
      { identifier: email },
      {
        otpCode: otp,
        expiresAt: expiry,
        type: "EMAIL_VERIFICATION",
        userId: user._id,
      },
      { upsert: true, new: true },
    );

    const otpToken = await sendOtp(
      email,
      OtpType.EMAIL_VERIFICATION,
      user.fullName,
      user._id.toString(),
      config.jwt.email_verification_secret,
      config.jwt.otp_expires_in,
      "Verify your email",
    );

    return {
      message: "Please verify your email to login",
      token: otpToken?.otpToken,
      isVerify: false,
    };
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();

  await user.save();

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return {
    message: "Login successful",
    isVerify: user.isVerified,
    data: { accessToken, refreshToken },
  };
};

// ------------------------------
// REFRESH TOKEN
// ------------------------------
const refreshToken = async (token: string) => {
  let decoded;

  try {
    decoded = jwtHelpers.verifyToken(token, config.jwt.refresh_secret);
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await UserModel.findById(decoded.id);
  if (!user) throw new ApiError(401, "User not found");

  if (decoded.tokenVersion !== user.tokenVersion)
    throw new ApiError(401, "Refresh token expired or reused");

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const newRefreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return { accessToken, refreshToken: newRefreshToken };
};

// ------------------------------
// GET PROFILE
// ------------------------------
const getMyProfile = async (email: string) => {
  const profile = await UserModel.findOne(
    { email },
    {
      _id: 1,
      fullName: 1,
      email: 1,
      phoneNo: 1,
      image: 1,
      role: 1,
      isVerified: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  );

  if (!profile) throw new ApiError(404, "User not found");

  return profile;
};

// ------------------------------
// RESET PASSWORD
// ------------------------------
const resetPassword = async (email: string, newPassword: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const hashedPassword = await hashPassword(newPassword);

  await UserModel.updateOne({ _id: user._id }, { password: hashedPassword });

  return { message: "Password reset successful" };
};

// ------------------------------
// CHANGE PASSWORD
// ------------------------------
const changePassword = async (
  userId: string,
  newPassword: string,
  oldPassword: string,
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const isCorrect = await comparePassword(oldPassword, user.password);
  if (!isCorrect) throw new ApiError(401, "Old password incorrect");

  const hashedPassword = await hashPassword(newPassword);

  await UserModel.updateOne({ _id: userId }, { password: hashedPassword });

  return { message: "Password changed successfully" };
};

// ------------------------------
// SEND OTP SERVICE
// ------------------------------
const sendOtpService = async (email: string, type: OtpType) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  let secret = "";

  if (type === "EMAIL_VERIFICATION") {
    if (user.isVerified) throw new ApiError(400, "User is already verified");

    secret = config.jwt.email_verification_secret;
  } else if (type === "PASSWORD_RESET") {
    secret = config.jwt.password_reset_secret;
  } else {
    throw new ApiError(400, "Invalid OTP type");
  }

  const otpToken = await sendOtp(
    email,
    type,
    user.fullName,
    user._id.toString(),
    secret,
    config.jwt.otp_expires_in,
    type === "EMAIL_VERIFICATION" ? "Verify your email" : "Reset Password",
  );

  return { message: "OTP sent to email", token: otpToken };
};

/* ===========================
        LOGOUT USER
=========================== */
const logout = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  user.tokenVersion += 1;
  await user.save();

  return { message: "Logged out successfully" };
};

export const AuthServices = {
  registerUser,
  verifyOtp,
  loginUser,
  refreshToken,
  getMyProfile,
  resetPassword,
  changePassword,
  logout,
  sendOtpService,
};
