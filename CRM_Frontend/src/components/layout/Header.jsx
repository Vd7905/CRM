import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-background/70 backdrop-blur-lg border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight hover:text-primary transition-colors flex-shrink-0"
        >
          CRM<span className="text-primary"> PRO</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center space-x-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-foreground/80"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/campaigns"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-foreground/80"
              }`
            }
          >
            Campaigns
          </NavLink>
          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary" : "text-foreground/80"
              }`
            }
          >
            Customers
          </NavLink>
        </nav>

        {/* Desktop Actions: Login + ThemeToggle */}
        <div className="hidden md:flex items-center justify-evenly gap-4 flex-shrink-0 w-3xs">
          <Button asChild size="sm" className="rounded-full px-4">
            <Link to="/login">Login</Link>
          </Button>
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
            <SheetContent
              side="right"
              className="flex flex-col gap-5 p-6 bg-background/95 backdrop-blur-lg"
            >
              {/* Mobile Nav Links */}
              <NavLink
                to="/"
                className="text-base font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/campaigns"
                className="text-base font-medium hover:text-primary transition-colors"
              >
                Campaigns
              </NavLink>
              <NavLink
                to="/customers"
                className="text-base font-medium hover:text-primary transition-colors"
              >
                Customers
              </NavLink>

              <hr className="border-border/40" />

              {/* Mobile Actions */}
              <Button asChild className="rounded-full">
                <Link to="/login">Login</Link>
              </Button>
              <ThemeToggle />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
