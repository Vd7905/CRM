// import React, { useState, useEffect, useRef, createContext, useContext } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Eye, EyeOff, Lock, Mail, Moon, Sun, Palette, Check } from "lucide-react";
// import { FcGoogle } from "react-icons/fc";

// // ---------------------- Theme Context ----------------------
// const ThemeContext = createContext();

// const colorPalettes = {
//   purple: { primary: "#8b5cf6", secondary: "#9d4edd" },
//   blue: { primary: "#3b82f6", secondary: "#60a5fa" },
//   green: { primary: "#10b981", secondary: "#22c55e" },
//   orange: { primary: "#f97316", secondary: "#fb923c" },
//   amber: { primary: "#f59e0b", secondary: "#fbbf24" },
//   rose: { primary: "#f43f5e", secondary: "#f472b6" },
//   teal: { primary: "#14b8a6", secondary: "#2dd4bf" },
// };

// const themes = {
//   light: {
//     background: "#f9fafb",
//     foreground: "#1f2937",
//     muted: "#e5e7eb",
//     card: "#ffffff",
//     text: "#1f2937",
//   },
//   dark: {
//     background: "#1f2937",
//     foreground: "#f9fafb",
//     muted: "#374151",
//     card: "#111827",
//     text: "#f9fafb",
//   },
// };

// function ThemeProvider({ children }) {
//   const [theme, setTheme] = useState("dark");
//   const [color, setColor] = useState("purple");

//   useEffect(() => {
//     const root = document.documentElement;
//     const palette = colorPalettes[color];
//     const currentTheme = themes[theme];

//     root.style.setProperty("--background", currentTheme.background);
//     root.style.setProperty("--foreground", currentTheme.foreground);
//     root.style.setProperty("--muted", currentTheme.muted);
//     root.style.setProperty("--card", currentTheme.card);
//     root.style.setProperty("--text", currentTheme.text);
//     root.style.setProperty("--primary", palette.primary);
//     root.style.setProperty("--secondary", palette.secondary);
//   }, [theme, color]);

//   const changeColor = (newColor) => setColor(newColor);

//   return (
//     <ThemeContext.Provider value={{ theme, color, setTheme, changeColor }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// const useTheme = () => useContext(ThemeContext);

// // ---------------------- Theme Toggle & Color Picker ----------------------
// function ThemeToggle() {
//   const { theme, setTheme, color, changeColor } = useTheme();
//   const [showColorPicker, setShowColorPicker] = useState(false);

//   return (
//     <div className="fixed top-4 right-4 z-50 flex gap-2">
//       <Button
//         variant="outline"
//         size="icon"
//         onClick={() => setTheme(theme === "light" ? "dark" : "light")}
//         className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/40 hover:bg-accent/80"
//       >
//         {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
//       </Button>

//       <div className="relative">
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={() => setShowColorPicker(!showColorPicker)}
//           className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/40 hover:bg-accent/80"
//         >
//           <Palette className="h-4 w-4" />
//         </Button>

//         {showColorPicker && (
//           <div className="absolute top-12 right-0 bg-card/95 backdrop-blur-sm border border-border/40 rounded-lg p-3 shadow-lg min-w-[200px]">
//             <p className="text-sm font-medium mb-2 text-text">Colors</p>
//             <div className="grid grid-cols-2 gap-2">
//                 {Object.keys(colorPalettes).map((c) => (
//   <button
//     key={c}
//     onClick={() => {
//       changeColor(c);
//       setShowColorPicker(false);
//     }}
//     className={`flex items-center justify-between w-full p-2 rounded text-sm transition-colors 
//       ${color === c ? "bg-[var(--primary)]/20" : "hover:bg-accent/50"}`}
//   >
//     {/* Left side: color dot + name */}
//     <div className="flex items-center gap-2">
//       <div
//         className="w-4 h-4 rounded-full border flex-shrink-0"
//         style={{ background: colorPalettes[c].primary }}
//       />
//       <span
//         className={`capitalize text-[var(--text)] ${color === c ? "font-bold" : ""}`}
//       >
//         {c}
//       </span>
//     </div>

//     {/* Right side: tick */}
//     {color === c && <Check className="h-3 w-3 text-[var(--primary)] flex-shrink-0" />}
//   </button>
// ))}


//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ---------------------- Interactive 3D Scene ----------------------
// function Interactive3DScene() {
//   const mountRef = useRef(null);
//   const torusRef = useRef(null);
//   const animationRef = useRef(null);
//   const { theme, color } = useTheme();

//   useEffect(() => {
//     const mount = mountRef.current;
//     if (!mount) return;

//     const scene = new THREE.Scene();

//     const camera = new THREE.PerspectiveCamera(
//       75,
//       mount.clientWidth / mount.clientHeight,
//       0.1,
//       1000
//     );

//     // Responsive camera position
//     const isMobile = mount.clientWidth < 640;
   
//     const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
//     renderer.setSize(mount.clientWidth, mount.clientHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.setClearColor(0x000000, 0); // Transparent background
//     mount.appendChild(renderer.domElement);

//     const ambientLight = new THREE.AmbientLight(0xffffff, theme === "light" ? 0.9 : 0.6);
//     scene.add(ambientLight);

//     const pointLight = new THREE.PointLight(parseInt(colorPalettes[color].primary.slice(1), 16), 1.2);
//     pointLight.position.set(10, 10, 10);
//     scene.add(pointLight);

//     const torus = new THREE.Mesh(
//       new THREE.TorusKnotGeometry(1.2, 0.3, 150, 32),
//       new THREE.MeshStandardMaterial({
//         color: parseInt(colorPalettes[color].primary.slice(1), 16),
//         roughness: 0.2,
//         metalness: 0.9,
//         transparent: true,
//         opacity: 0.95,
//       })
//     );

//  camera.position.z = isMobile ? 5 : 5;   // zoom out on mobile
//  camera.position.y = isMobile ? 0 : 0; // slightly lower

// torus.position.y = isMobile ? -1.8 : -1.4; // move torus down
// const scale = isMobile ? 1 : 1;          // smaller on mobile
// torus.scale.set(scale, scale, scale);
// scene.add(torus);
// torusRef.current = torus;

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;
//     controls.dampingFactor = 0.05;
//     controls.enableZoom = false;

//     const animate = () => {
//       torus.rotation.x += 0.005;
//       torus.rotation.y += 0.01;
//       controls.update();
//       renderer.render(scene, camera);
//       animationRef.current = requestAnimationFrame(animate);
//     };
//     animate();

//     const handleResize = () => {
//       camera.aspect = mount.clientWidth / mount.clientHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(mount.clientWidth, mount.clientHeight);
//     };

//     window.addEventListener("resize", handleResize);
//     handleResize();

//     return () => {
//       cancelAnimationFrame(animationRef.current);
//       window.removeEventListener("resize", handleResize);
//       if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
//       renderer.dispose();
//       scene.clear();
//     };
//   }, [theme, color]);

//   return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-auto" />;
// }

// // ---------------------- Login Form ----------------------
// function LoginForm() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSignup, setIsSignup] = useState(false);

//   const handleAuth = async () => {
//     setIsLoading(true);
//     await new Promise((res) => setTimeout(res, 1500));
//     console.log(isSignup ? "Sign up" : "Login", { email, password });
//     setIsLoading(false);
//   };

//   const handleGoogleAuth = async () => {
//     setIsLoading(true);
//     await new Promise((res) => setTimeout(res, 1500));
//     console.log("Google Auth");
//     setIsLoading(false);
//   };

//   return (
//     <div className="min-h-screen relative overflow-hidden bg-[var(--background)] text-[var(--text)]">
//       <ThemeToggle />

//       <div className="grid lg:grid-cols-2 min-h-screen">
//         {/* 3D Scene */}
//         <div className="grid lg:grid-cols-2 relative">
//   {/* 3D Scene */}
//   <div className="absolute inset-0 lg:static z-0 opacity-40 lg:opacity-100 pointer-events-none">
//     <Interactive3DScene />
//   </div>

//   {/* CRM Heading + Description */}
//   <div className="relative z-10 flex flex-col items-center justify-start pt-8 px-4 sm:px-8 text-center lg:text-left lg:top-8 lg:left-8 lg:max-w-md lg:absolute">
//     <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
//       <span>CRM PRO</span>
//     </h1>
//     <p className="text-sm sm:text-base lg:text-lg leading-relaxed font-medium text-[var(--foreground)]/80 mt-2">
//       Experience the future of customer relationship management
//     </p>
//   </div>
//         </div>

//         {/* Login Form */}
//         <div className="flex items-center justify-center p-6 lg:p-8 bg-[var(--background)]/50 backdrop-blur-xl overflow-y-auto">
//           <div className="w-full max-w-sm">
//             <Card className="backdrop-blur-xl border shadow-2xl bg-[var(--card)]">
//               <CardHeader className="text-center space-y-2 pb-6">
//                 <CardTitle className="text-2xl font-bold text-[var(--foreground)]">
//                   {isSignup ? "Create Account" : "Welcome Back"}
//                 </CardTitle>
//                 <CardDescription className="text-[var(--foreground)]/90">
//                   {isSignup ? "Sign up to get started" : "Sign in to your account"}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-3">
//                   <div className="space-y-2">
//                     <Label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
//                       Email
//                     </Label>
//                     <div className="relative">
//                       <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/60" />
//                       <Input
//                         id="email"
//                         type="email"
//                         placeholder="Enter your email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="pl-10 h-10"
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="password" className="text-sm font-medium text-[var(--foreground)]">
//                       Password
//                     </Label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/60" />
//                       <Input
//                         id="password"
//                         type={showPassword ? "text" : "password"}
//                         placeholder="Enter password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="pl-10 pr-10 h-10"
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
//                       >
//                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                       </button>
//                     </div>
//                   </div>
//                   <Button
//                     onClick={handleAuth}
//                     className="w-full h-10 bg-[var(--primary)] hover:bg-[var(--secondary)] text-[var(--card)] font-medium transition-all duration-300 transform hover:scale-[1.02]"
//                     disabled={isLoading}
//                   >
//                     {isLoading ? "Processing..." : isSignup ? "Sign Up" : "Sign In"}
//                   </Button>

//                   <Button
//                     onClick={handleGoogleAuth}
//                     variant="outline"
//                     className="w-full h-10 flex items-center justify-center space-x-2 text-[var(--foreground)] border-[var(--foreground)] hover:bg-[var(--muted)]/50"
//                   >
//                     <FcGoogle className="w-5 h-5" />{" "}
//                     <span>{isSignup ? "Sign up with Google" : "Continue with Google"}</span>
//                   </Button>

//                   <div className="text-center">
//                     <button
//                       onClick={() => setIsSignup(!isSignup)}
//                       className="text-[var(--primary)] hover:text-[var(--secondary)] font-semibold transition-colors text-sm mt-2"
//                     >
//                       {isSignup
//                         ? "Already have an account? Sign In"
//                         : "New user? Sign Up here"}
//                     </button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ---------------------- Main Page ----------------------
// export default function LoginPage() {
//   return (
//     <ThemeProvider>
//       <LoginForm />
//     </ThemeProvider>
//   );
// }




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

