// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String }, // only required for email+password login
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  avatar: String,
  role: {
    type: String,
    enum: ["admin", "marketer", "analyst"],
    default: "marketer",
  },
  last_login: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: Date,
});

// Hash password before saving (only if modified and exists)
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updated_at = Date.now();
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false; // in case of Google-only user
  return bcrypt.compare(password, this.password);
};


userSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

export const User = mongoose.model("User", userSchema);