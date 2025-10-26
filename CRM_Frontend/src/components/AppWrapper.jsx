import React, { useEffect, useState } from "react";
import App from "../App";

export default function AppWrapper() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Make sure the CSS variables are already applied
    const theme = localStorage.getItem("theme") || "dark";
    const color = localStorage.getItem("color") || "purple";

    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    setReady(true); // now we can render the app
  }, []);

  return ready ? <App /> : null; // render nothing until theme is applied
}
