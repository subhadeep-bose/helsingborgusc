import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, LogOut, ChevronDown, Newspaper, Users, LayoutDashboard, Calendar, Image } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home" },
  { to: "/registration", label: "Join Us" },
  { to: "/members", label: "Members" },
  { to: "/board", label: "Board" },
  { to: "/schedule", label: "Schedule" },
  { to: "/gallery", label: "Gallery" },
];

const adminLinks = [
  { to: "/admin/announcements", label: "News", icon: Newspaper },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/board", label: "Board", icon: LayoutDashboard },
  { to: "/admin/schedule", label: "Schedule", icon: Calendar },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  // Close admin dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setAdminOpen(false);
    setOpen(false);
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-display font-bold text-secondary-foreground text-lg">
            HU
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-primary-foreground text-lg leading-tight tracking-wide">
              Helsingborg United
            </p>
            <p className="text-primary-foreground/70 text-xs tracking-widest uppercase">
              Sports Club
            </p>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded font-body text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? "bg-secondary text-secondary-foreground"
                  : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {l.label}
            </Link>
          ))}

          {/* Admin dropdown */}
          {isAdmin && (
            <div ref={adminRef} className="relative">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                onKeyDown={(e) => { if (e.key === "Escape") setAdminOpen(false); }}
                aria-expanded={adminOpen}
                aria-haspopup="true"
                className={`px-4 py-2 rounded font-body text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                  isAdminRoute
                    ? "bg-secondary text-secondary-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                Admin <ChevronDown size={14} className={`transition-transform ${adminOpen ? "rotate-180" : ""}`} />
              </button>
              {adminOpen && (
                <div role="menu" className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-card shadow-lg z-50 py-1">
                  {adminLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-body transition-colors ${
                        location.pathname === l.to
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <l.icon size={15} className="shrink-0" /> {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {user ? (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded font-body text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors inline-flex items-center gap-1.5"
            >
              <LogOut size={14} /> Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded font-body text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors inline-flex items-center gap-1.5"
            >
              <LogIn size={14} /> Login
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/10 pb-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`block px-6 py-3 font-body text-sm transition-colors ${
                location.pathname === l.to
                  ? "bg-secondary text-secondary-foreground"
                  : "text-primary-foreground/80 hover:bg-primary-foreground/10"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <div className="px-6 py-2 text-xs text-primary-foreground/50 uppercase tracking-wider font-display">Admin</div>
              {adminLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`block px-6 py-3 font-body text-sm transition-colors ${
                    location.pathname === l.to
                      ? "bg-secondary text-secondary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </>
          )}
          {user ? (
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-6 py-3 font-body text-sm text-primary-foreground/80 hover:bg-primary-foreground/10 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              className="block px-6 py-3 font-body text-sm text-primary-foreground/80 hover:bg-primary-foreground/10 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
