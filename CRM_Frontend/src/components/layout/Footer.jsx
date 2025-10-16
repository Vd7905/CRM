export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background text-muted-foreground text-sm py-4 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <p>© {new Date().getFullYear()} CRM PRO. All rights reserved.</p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-primary">Privacy Policy</a>
          <a href="#" className="hover:text-primary">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
