import { Router } from "express";
import {
  googleLogin,
  emailSignup,
  emailLogin,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = Router();

// ---------- Google Auth ----------
router.route("/google-login").post(googleLogin);

// ---------- Email + Password Auth ----------
router.route("/signup").post(emailSignup);
router.route("/login").post(emailLogin);

// ---------- Logout ----------
router.route("/logout").post(logout);

// forget-password
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

// ---------- Refresh Token ----------
router.route("/refresh-token").post(refreshAccessToken);

// ---------- Verify Authenticated User ----------
router.route("/verify").get(authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
