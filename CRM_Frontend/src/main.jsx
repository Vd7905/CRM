import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import  {ThemeProvider}  from "./context/ThemeProvider";
import { GoogleOAuthProvider} from "@react-oauth/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import AppWrapper from './components/AppWrapper';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="415720389429-kui61m56c3ed542fcoo8vik6otjb3e1g.apps.googleusercontent.com">
    <AuthProvider>
    <ThemeProvider>
      <AppWrapper />
      <Toaster richColors position="top-center"/>
    </ThemeProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)
