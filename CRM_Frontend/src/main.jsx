import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import  {ThemeProvider}  from "./context/ThemeProvider";
import { GoogleOAuthProvider} from "@react-oauth/google";
import { Toaster } from "sonner";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="415720389429-kui61m56c3ed542fcoo8vik6otjb3e1g.apps.googleusercontent.com">
    <ThemeProvider>
      <App />
      <Toaster richColors position="top-center"/>
    </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
