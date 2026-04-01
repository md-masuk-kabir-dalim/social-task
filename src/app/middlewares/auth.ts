import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/ApiErrors";
import { UserModel } from "../modules/User/user.model";
import { clearCookie } from "../../utils/cookieHelper";

const auth = (...roles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (!token) {
        token = req.cookies?.accessToken ?? req?.cookies?.otpToken;
      }

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      let secret: Secret;
      const url = req.originalUrl;

      if (url.includes("/refresh-token")) {
        secret = config.jwt.refresh_secret;
      } else if (url.includes("/verify-otp")) {
        secret = config.jwt.email_verification_secret;
      } else if (url.includes("/reset-password")) {
        secret = config.jwt.password_reset_secret;
      } else {
        secret = config.jwt.access_secret;
      }

      let verifiedUser: any;

      const user = await UserModel.findOne({ email: verifiedUser.email });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
      }

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }

      req.user = verifiedUser;

      next();
    } catch (err) {
      next(err);
    } finally {
      clearCookie(res, "ACCESS");
      clearCookie(res, "REFRESH");
      clearCookie(res, "OTP");
    }
  };
};

export default auth;
