import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

const authenticate = asyncHandler(async (req, res, next) => {
  try {
    // Get token from Authorization header (localStorage tokens must be sent here)
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized request - No token provided");
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from DB
    const user = await User.findById(decoded.id).select("-password -refreshToken");
    if (!user) throw new ApiError(401, "User not found");

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export default authenticate;
