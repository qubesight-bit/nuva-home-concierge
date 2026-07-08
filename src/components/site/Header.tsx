import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LayoutDashboard, Globe, Home } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-1.5 text-xl font-bold tracking-tight">
      <span className="notranslate" translate="no">Nuva</span>
      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-gradient-gold" aria-hidden />
    </Link>
  );
}

function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <label className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm notranslate ${compact ? "" : "font-medium"}`} translate="no">
      <Globe className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">Language</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="bg-transparent pr-1 text-sm outline-none"
        aria-label="Language"
      >
        {(Object.keys(LANGS) as Lang[]).map((code) => (
          <option key={code} value={code}>{LANGS[code]}</option>
        ))}
      </select>
    </label>
  );
}

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/browse", label: "Browse Providers" },
  { to: "/pricing", label: "Pricing" },
  { to: "/safety", label: "Safety" },
  { to: "/faq", label: "FAQ" },
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "inline-flex items-center gap-1.5 text-sm font-medium text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {"icon" in item && item.icon ? <item.icon className="h-4 w-4" aria-hidden /> : null}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <LangSwitcher />
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:shadow-soft"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
            )}
            <Link
              to="/browse"
              search={{ country: "", category: "all" }}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:shadow-lift hover:opacity-90"
            >
              Book Now
            </Link>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-border/60 px-4 pb-6 pt-3 md:hidden animate-fade-in">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                >
                  {"icon" in item && item.icon ? <item.icon className="h-4 w-4" aria-hidden /> : null}
                  {item.label}
                </Link>
              ))}
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
              >
                Log in
              </Link>
              <div className="px-1 py-2">
                <LangSwitcher compact />
              </div>
              <Link
                to="/browse"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-base font-semibold text-primary-foreground"
              >
                Book Now
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
