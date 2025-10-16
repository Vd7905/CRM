import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Interactive3DScene from "./3D/Interactive3DScene";
import ThemeToggle from "./ThemeToggle/ThemeToggle";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleAuth = async () => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1500));
    console.log(isSignup ? "Sign up" : "Login", { email, password });
    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1500));
    console.log("Google Auth");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--background)] text-[var(--text)]">
      <ThemeToggle />

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* 3D Scene + Heading */}
        <div className="grid lg:grid-cols-2 relative">
          <div className="absolute inset-0 lg:static z-0 opacity-40 lg:opacity-100 pointer-events-none">
            <Interactive3DScene />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-start pt-8 px-4 sm:px-8 text-center lg:text-left lg:top-8 lg:left-8 lg:max-w-md lg:absolute">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">CRM <span className="text-primary"> PRO</span></h1>
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed font-medium text-[var(--foreground)]/80 mt-2">
              Experience the future of customer relationship management
            </p>
          </div>
        </div>

        {/* Login Form */}
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
                <div className="space-y-3">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/60" />
                      <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e)=>setEmail(e.target.value)} className="pl-10 h-10" required />
                    </div>
                  </div>
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-[var(--foreground)]">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/60" />
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e)=>setPassword(e.target.value)} className="pl-10 pr-10 h-10" required />
                      <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                      </button>
                    </div>
                  </div>

                  {/* Sign in/up button */}
                  <Button onClick={handleAuth} className="w-full h-10 bg-[var(--primary)] hover:bg-[var(--secondary)] text-[var(--card)] font-medium transition-all duration-300 transform hover:scale-[1.02]" disabled={isLoading}>
                    {isLoading ? "Processing..." : isSignup ? "Sign Up" : "Sign In"}
                  </Button>

                  {/* Google Auth */}
                  <Button onClick={handleGoogleAuth} variant="outline" className="w-full h-10 flex items-center justify-center space-x-2 text-[var(--foreground)] border-[var(--foreground)] hover:bg-[var(--muted)]">
                    <FcGoogle className="w-5 h-5" /> <span>{isSignup ? "Sign up with Google" : "Continue with Google"}</span>
                  </Button>

                  {/* Toggle Sign up/Login */}
                  <div className="text-center">
                    <button onClick={()=>setIsSignup(!isSignup)} className="text-[var(--primary)] hover:text-[var(--secondary)] font-semibold transition-colors text-sm mt-2">
                      {isSignup ? "Already have an account? Sign In" : "New user? Sign Up here"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
