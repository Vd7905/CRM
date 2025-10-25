// // controllers/auth.controller.js
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import verifyGoogleToken from "../utils/googleOAuth.js";
// import { generateTokens } from "../utils/jwt.js";
// import { User } from "../models/user.model.js";
// import { sendEmail } from "../utils/sendEmail.js";
// import crypto from "crypto";

// // ================== GOOGLE LOGIN ==================
// const googleLogin = asyncHandler(async (req, res) => {
//   const { token } = req.body;

//   if (!token) {
//     throw new ApiError(400, "Google token is required");
//   }

//   const googleUser = await verifyGoogleToken(token);
//   if (!googleUser) {
//     throw new ApiError(401, "Invalid Google token");
//   }

//   // Check if user exists
//   let user = await User.findOne({ email: googleUser.email });

//   if (!user) {
//     // Create new user
//     user = await User.create({
//       googleId: googleUser.sub,
//       email: googleUser.email,
//       name: googleUser.name,
//       avatar: googleUser.picture,
//       isVerified: true,
//     });
//   } else if (!user.googleId) {
//     // Update existing user with Google ID
//     user.googleId = googleUser.sub;
//     await user.save();
//   }

//   // Generate tokens
//   const { accessToken, refreshToken } = generateTokens(user);

//   // Set cookies
//   const cookieOptions = {
//     httpOnly: true,
//     secure: true,
//     sameSite: "None",
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   };

//   res.cookie("accessToken", accessToken, cookieOptions);
//   res.cookie("refreshToken", refreshToken, cookieOptions);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, { user }, "Google login successful"));
// });

// // ================== EMAIL SIGNUP ==================
// const emailSignup = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   if (!name || !email || !password) {
//     throw new ApiError(400, "Name, email and password are required");
//   }

//   let user = await User.findOne({ email });
//   if (user) {
//     throw new ApiError(400, "User already exists with this email");
//   }

//   user = await User.create({ name, email, password });

//   const { accessToken, refreshToken } = generateTokens(user);

//   const cookieOptions = {
//     httpOnly: true,
//     secure: true,
//     sameSite: "None",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   };

//   res.cookie("accessToken", accessToken, cookieOptions);
//   res.cookie("refreshToken", refreshToken, cookieOptions);

//   return res
//     .status(201)
//     .json(new ApiResponse(201, { user }, "Signup successful"));
// });

// // ================== EMAIL LOGIN ==================
// const emailLogin = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     throw new ApiError(400, "Email and password are required");
//   }

//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new ApiError(401, "Invalid email or password");
//   }

//   const isMatch = await user.comparePassword(password);
//   if (!isMatch) {
//     throw new ApiError(401, "Invalid email or password");
//   }

//   const { accessToken, refreshToken } = generateTokens(user);

//   const cookieOptions = {
//     httpOnly: true,
//     secure: true,
//     sameSite: "None",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   };

//   res.cookie("accessToken", accessToken, cookieOptions);
//   res.cookie("refreshToken", refreshToken, cookieOptions);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {user,accessToken}, "Login successful"));
// });

// // ================== LOGOUT ==================
// const logout = asyncHandler(async (req, res) => {
//   res.clearCookie("accessToken", {
//     httpOnly: true,
//     secure: true,
//     sameSite: "None",
//   });
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: true,
//     sameSite: "None",
//   });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, null, "Logged out successfully"));
// });


// // ================== FORGOT PASSWORD ==================
// const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   if (!email) throw new ApiError(400, "Email is required");

//   const user = await User.findOne({ email });
//   if (!user) throw new ApiError(404, "User not found");

//   // Generate reset token
//   const resetToken = crypto.randomBytes(32).toString("hex");
//   const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

//   user.resetPasswordToken = hashedToken;
//   user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
//   await user.save();

//   // Send email to user with reset link
//   const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
//   const message = `You requested a password reset. Click here: ${resetUrl}`;

//   await sendEmail({
//     to: user.email,
//     subject: "Password Reset Request",
//     text: message,
//   });

//   return res.status(200).json(new ApiResponse(200, null, "Reset password link sent to email"));
// });

// // ================== RESET PASSWORD ==================
// const resetPassword = asyncHandler(async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   if (!password) throw new ApiError(400, "New password is required");

//   const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//   const user = await User.findOne({
//     resetPasswordToken: hashedToken,
//     resetPasswordExpires: { $gt: Date.now() },
//   });

//   if (!user) throw new ApiError(400, "Invalid or expired token");

//   user.password = password; // will be hashed automatically in pre-save hook
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpires = undefined;
//   await user.save();

//   return res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
// });


// // ================== REFRESH TOKEN ==================
// const refreshAccessToken = asyncHandler(async (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     throw new ApiError(401, "Unauthorized request");
//   }

//   try {
//     const decoded = verifyRefreshToken(refreshToken);
//     const user = await User.findById(decoded.id);

//     if (!user) {
//       throw new ApiError(401, "Invalid refresh token");
//     }

//     const { accessToken } = generateTokens(user);

//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000,
//     });

//     return res
//       .status(200)
//       .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
//   } catch (error) {
//     throw new ApiError(401, error?.message || "Invalid refresh token");
//   }
// });

// export {
//   googleLogin,
//   emailSignup,
//   emailLogin,
//   logout,
//   refreshAccessToken,
//   forgotPassword,
//   resetPassword
// };

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import verifyGoogleToken from "../utils/googleOAuth.js";
import { generateTokens } from "../utils/jwt.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// ================== GOOGLE LOGIN ==================
const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new ApiError(400, "Google token is required");

  const googleUser = await verifyGoogleToken(token);
  if (!googleUser) throw new ApiError(401, "Invalid Google token");

  let user = await User.findOne({ email: googleUser.email });
  if (!user) {
    user = await User.create({
      googleId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.picture,
      isVerified: true,
    });
  } else if (!user.googleId) {
    user.googleId = googleUser.sub;
    await user.save();
  }

  const { accessToken, refreshToken } = generateTokens(user);

  return res
    .status(200)
    .json(new ApiResponse(200, { user, accessToken, refreshToken }, "Google login successful"));
});

// ================== EMAIL SIGNUP ==================
const emailSignup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email and password are required");

  let user = await User.findOne({ email });
  if (user) throw new ApiError(400, "User already exists with this email");

  user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = generateTokens(user);

  return res
    .status(201)
    .json(new ApiResponse(201, { user, accessToken, refreshToken }, "Signup successful"));
});

// ================== EMAIL LOGIN ==================
const emailLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const { accessToken, refreshToken } = generateTokens(user);

  return res
    .status(200)
    .json(new ApiResponse(200, { user, accessToken, refreshToken }, "Login successful"));
});

// ================== LOGOUT ==================
const logout = asyncHandler(async (_req, res) => {
  // Tokens are stored client-side, so just return success
  return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

// ================== FORGOT PASSWORD ==================
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `You requested a password reset. Click here: ${resetUrl}`;

  await sendEmail({ to: user.email, subject: "Password Reset Request", text: message });

  return res.status(200).json(new ApiResponse(200, null, "Reset password link sent to email"));
});

// ================== RESET PASSWORD ==================
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) throw new ApiError(400, "New password is required");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired token");

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
});

// ================== REFRESH TOKEN ==================
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(401, "Refresh token is required");

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, "User not found");

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    return res.status(200).json(new ApiResponse(200, { user, accessToken, refreshToken: newRefreshToken }, "Token refreshed successfully"));
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

export {
  googleLogin,
  emailSignup,
  emailLogin,
  logout,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
};

