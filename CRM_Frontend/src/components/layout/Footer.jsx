import { FaLinkedin } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background text-muted-foreground text-sm py-4 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <p>© {new Date().getFullYear()} CRM PRO. All rights reserved.</p>

        <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-2 md:space-y-0">
          <p className="flex items-center space-x-1">
            <span>Made by</span>
            <a
              href="https://www.linkedin.com/in/vikas-dixit-2846b21b9/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center font-medium space-x-1 transition-colors group"
            >
              <span className="group-hover:text-primary">Vikas Dixit</span>
              <FaLinkedin className="w-4 h-4 text-muted-foreground group-hover:text-[#0A66C2] transition-colors" />
            </a>
          </p>

          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary font-medium transition-colors"
          >
            User Manual
          </a>
        </div>
      </div>
    </footer>
  );
}
