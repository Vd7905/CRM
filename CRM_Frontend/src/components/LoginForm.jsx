"use client";
import React, { useRef, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
import Interactive3DScene from "./3D/Interactive3DScene";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import api from "@/utils/axios";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";

export default function LoginForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const googleDivRef = useRef(null);
  const GOOGLE_CLIENT_ID =
    "415720389429-kui61m56c3ed542fcoo8vik6otjb3e1g.apps.googleusercontent.com";

  // Store user info and tokens
  const storeUserData = (user, accessToken, refreshToken) => {
    try {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    } catch (e) {
      console.error("Failed to write localStorage", e);
    }
  };

  // 🔹 Main Auth (email/password)
  const handleAuth = async () => {
    if (!email || !password || (isSignup && !name)) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
    const payload = isSignup ? { name, email, password } : { email, password };

    try {
      const res = await api.post(endpoint, payload);
      const { user, accessToken, refreshToken } = res.data?.data || {};
      if (user && accessToken && refreshToken) {
        storeUserData(user, accessToken, refreshToken);
        setUser(user);
        toast.success(isSignup ? "Signup successful!" : "Login successful!");
        navigate("/", { replace: true });
      } else toast.error("Invalid response from server");
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Google Login handler
  const handleGoogleLogin = async (response) => {
    const token = response?.credential;
    if (!token) return toast.error("No Google token received");

    const toastId = toast.loading("Signing in with Google...");
    try {
      const res = await api.post("/api/auth/google-login", { token });
      const { user, accessToken, refreshToken } = res.data?.data || {};
      if (user && accessToken && refreshToken) {
        storeUserData(user, accessToken, refreshToken);
        setUser(user);
        toast.dismiss(toastId);
        toast.success("Google login successful!");
        navigate("/", { replace: true });
      } else {
        toast.dismiss(toastId);
        toast.error("Invalid response from server");
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Google login failed");
    }
  };

  // 🔹 Load Google Script and render button
  useEffect(() => {
    const renderGoogleButton = () => {
      if (!window.google || !googleDivRef.current) return;
      googleDivRef.current.innerHTML = ""; // clear previous button

      const containerWidth = googleDivRef.current.offsetWidth;
      const size = containerWidth < 300 ? "medium" : "large";

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      window.google.accounts.id.renderButton(googleDivRef.current, {
        theme: "outline",
        size,
        text: "continue_with",
        width: containerWidth.toString(),
        shape: "rectangular",
        logo_alignment: "left",
      });
    };

    if (window.google) renderGoogleButton();
    else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      document.body.appendChild(script);
    }

    window.addEventListener("resize", renderGoogleButton);
    return () => {
      window.removeEventListener("resize", renderGoogleButton);
      if (googleDivRef.current) googleDivRef.current.innerHTML = "";
    };
  }, []);

  // 🔹 Forgot password
  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    if (!forgotEmail) return toast.error("Please enter your email");
    setIsForgotLoading(true);
    try {
      const res = await api.post("/api/auth/forgot-password", {
        email: forgotEmail,
      });
      toast.success(res.data.message || "Reset link sent!");
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleAuth();
  };

  // ✅ UI
  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--background)] text-[var(--text)]">
      <ThemeToggle />

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* 3D Section */}
        <div className="grid lg:grid-cols-2 relative">
          <div className="absolute inset-0 lg:static z-0 opacity-40 lg:opacity-100 pointer-events-none">
            <Interactive3DScene />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-start pt-8 px-4 sm:px-8 text-center lg:text-left lg:top-8 lg:left-8 lg:max-w-md lg:absolute">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
              CRM <span className="text-primary"> PRO</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed font-medium text-[var(--foreground)]/80 mt-2">
              Experience the future of customer relationship management
            </p>
          </div>
        </div>

        {/* Login / Signup Section */}
        <div className="flex items-center justify-center p-6 lg:p-8 bg-[var(--background)]/50 backdrop-blur-xl overflow-y-auto">
          <div className="w-full max-w-sm">
            <Card className="backdrop-blur-xl border shadow-2xl bg-[var(--card)]">
              <CardHeader className="text-center space-y-2 pb-6">
                <CardTitle className="text-2xl font-bold text-[var(--foreground)]">
                  {isSignup ? "Create Account" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="text-[var(--foreground)]/90">
                  {isSignup ? "Sign up to get started" : "Sign in to your account"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <form onSubmit={onSubmit} noValidate autoComplete="off" className="space-y-3">
                  {isSignup && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/60" />
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="pl-10 h-10"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/60" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/60" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="pl-10 pr-10 h-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/60"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {!isSignup && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(true)}
                          className="text-xs text-[var(--primary)] hover:text-[var(--secondary)] font-semibold"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 bg-[var(--primary)] hover:bg-[var(--secondary)] text-[var(--card)] font-medium transition-all"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Processing..."
                      : isSignup
                      ? "Sign Up"
                      : "Sign In"}
                  </Button>
                </form>

                {/* ✅ Single Google button (no duplicates) */}
                <div className="mt-4 w-full flex flex-col items-center">
                  <div
                    ref={googleDivRef}
                    id="googleSignInDiv"
                    className="w-full flex justify-center items-center transition-all duration-300"
                    style={{ minHeight: "42px", zIndex: 10 }}
                  />
                </div>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => setIsSignup((s) => !s)}
                    className="text-[var(--primary)] hover:text-[var(--secondary)] font-semibold text-sm mt-2"
                  >
                    {isSignup
                      ? "Already have an account? Sign In"
                      : "New user? Sign Up here"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] p-6 rounded-2xl shadow-2xl w-80 relative backdrop-blur-lg border">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-3 right-3 text-[var(--foreground)]/70"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold mb-3 text-center text-[var(--foreground)]">
              Reset Your Password
            </h2>
            <p className="text-sm text-center text-[var(--foreground)]/70 mb-4">
              Enter your email and we’ll send you a password reset link.
            </p>
            <form onSubmit={handleForgotPassword} noValidate>
              <Input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="mb-4"
              />
              <Button
                type="submit"
                disabled={isForgotLoading}
                className="w-full h-10 bg-[var(--primary)] hover:bg-[var(--secondary)] text-[var(--card)]"
              >
                {isForgotLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
