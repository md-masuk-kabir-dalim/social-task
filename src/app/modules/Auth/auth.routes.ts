import express from "express";
import auth from "../../middlewares/auth";
import { AuthController } from "./auth.controller";
import { rateLimiter } from "../../middlewares/rate_limiter";

const router = express.Router();

// ------------------------------
// AUTHENTICATION ROUTES
// ------------------------------

router.post("/register", rateLimiter(10), AuthController.registerUser);
router.post("/login", rateLimiter(10), AuthController.loginUser);
router.post("/logout", auth(), rateLimiter(10), AuthController.logout);
router.post("/refresh-token", rateLimiter(10), AuthController.refreshToken);

// ------------------------------
// OTP / VERIFICATION ROUTES
// ------------------------------
router.post("/otp/send", rateLimiter(10), AuthController.otpSend);
router.patch("/otp/verify", auth(), rateLimiter(10), AuthController.verifyOtp);

// ------------------------------
// PASSWORD ROUTES
// ------------------------------
router.patch(
  "/password/reset",
  auth(),
  rateLimiter(10),
  AuthController.resetPassword,
);
router.patch(
  "/password/change",
  auth(),
  rateLimiter(10),
  AuthController.changePassword,
);

// ------------------------------
// PROFILE ROUTES
// ------------------------------

router.get("/me", auth(), AuthController.getMyProfile);

export const AuthRoutes = router;
