import React, { useEffect, useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, LogOut } from "lucide-react";
import api from "@/utils/axios";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

export function Header() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    let storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        storedUser = JSON.parse(storedUser);
      } catch {}
      if (storedUser?.name) {
        setName(storedUser.name);
        setEmail(storedUser.email || "");
        setIsLoggedIn(true);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const getUserInitials = (fullName) => {
    if (!fullName || typeof fullName !== "string") return "";
    const words = fullName.trim().split(" ");
    const first = words[0]?.[0]?.toUpperCase() || "";
    const last = words.length > 1 ? words[words.length - 1][0]?.toUpperCase() : "";
    return first + last;
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");

      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setIsLoggedIn(false);
      setName(null);
      setEmail(null);
      setUser(null); // update context

      navigate("/login", { replace: true });
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-background/70 backdrop-blur-lg border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-primary transition-colors flex-shrink-0">
          CRM<span className="text-primary"> PRO</span>
        </Link>

        <nav className="hidden md:flex flex-1 justify-center space-x-8">
          <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-foreground/80"}`}>Dashboard</NavLink>
          <NavLink to="/campaigns" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-foreground/80"}`}>Campaigns</NavLink>
          <NavLink to="/customers" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-foreground/80"}`}>Customers</NavLink>
        </nav>

        <div className="hidden md:flex items-center justify-evenly gap-4 flex-shrink-0 w-58">
          {isLoggedIn && name ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials(name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount style={{ background: "var(--card)", color: "var(--text)", border: `1px solid var(--muted)`, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{name}</p>
                    <p className="text-xs leading-none text-[var(--foreground)]/70">{email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="border-[var(--muted)]" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="rounded-full px-4">
              <Link to="/login">Login</Link>
            </Button>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent/60">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-5 p-6 bg-background/95 backdrop-blur-lg">
              <NavLink to="/" className="text-base font-medium hover:text-primary transition-colors">Dashboard</NavLink>
              <NavLink to="/campaigns" className="text-base font-medium hover:text-primary transition-colors">Campaigns</NavLink>
              <NavLink to="/customers" className="text-base font-medium hover:text-primary transition-colors">Customers</NavLink>
              <hr className="border-border/40" />
              {isLoggedIn && name ? (
                <>
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <Button onClick={handleLogout} variant="destructive" className="rounded-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <Button asChild className="rounded-full">
                  <Link to="/login">Login</Link>
                </Button>
              )}
              <ThemeToggle />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
