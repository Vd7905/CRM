import React from "react";
import { ThemeProvider } from "../context/ThemeProvider";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginForm />
    </ThemeProvider>
  );
}

