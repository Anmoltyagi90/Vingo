import express from "express";
import {
  googleAuth,
  Login,
  logout,
  register,
  resetPassword,
  sendOtp,
  verifyOtp,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", Login);
router.post("/logout", logout);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/google-auth", googleAuth);

export default router;
