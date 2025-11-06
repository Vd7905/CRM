"use client";
import React, { useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";
import api from "@/utils/axios";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import { toast } from "sonner"; // ShadCN Toast

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
 const handleReset = async () => {
  if (!password || !confirmPassword) {
    return toast.error("Please fill both fields");
  }
  if (password !== confirmPassword) {
    return toast.error("Passwords do not match");
  }

  setIsLoading(true);
  try {
    const { data } = await api.post(
      `/api/auth/reset-password/${token}`,
      { password },
      { headers: { Authorization: "" } }
    );
    toast.success(data.message || "Password reset successful");
    navigate("/login");
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Password reset failed");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--background)", color: "var(--text)" }}
    >
      <ThemeToggle/>
      <div className="w-full max-w-md p-6">
        <Card className="backdrop-blur-xl border shadow-2xl bg-[var(--card)]">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-[var(--foreground)]">
              Reset Password
            </CardTitle>
            <CardDescription className="text-[var(--foreground)]/90">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[var(--foreground)]">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 text-[var(--foreground)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--foreground)]">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/60" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 text-[var(--foreground)]"
                />
              </div>
            </div>

            <Button
              onClick={handleReset}
              className="w-full h-10 bg-[var(--primary)] hover:bg-[var(--secondary)] text-[var(--card)] font-medium transition-all duration-300 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="text-center mt-2">
              <button
                onClick={() => navigate("/login")}
                className="text-[var(--primary)] hover:text-[var(--secondary)] font-semibold text-sm"
              >
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
