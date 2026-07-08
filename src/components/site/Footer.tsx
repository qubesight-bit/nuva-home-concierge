import { Link } from "@tanstack/react-router";
import { Logo } from "./Header";

const columns = [
  {
    title: "Platform",
    links: [
      { to: "/browse", label: "Browse Providers" },
      { to: "/become-a-provider", label: "Become a Provider" },
      { to: "/pricing", label: "Pricing" },
      { to: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/safety", label: "Safety" },
      { to: "/faq", label: "FAQ" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms of Service" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Premium housekeeping, professional service, complete discretion. Verified
              professionals, secure payments, and safety at every step.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nuva. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Verified professionals · Encrypted communications · 24/7 support
          </p>
        </div>
      </div>
    </footer>
  );
}
