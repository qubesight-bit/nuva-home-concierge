import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Simple, Transparent Pricing | Nuva" },
      { name: "description", content: "No subscriptions, no hidden fees. Pay per booking with full price transparency, or unlock savings with Nuva Plus." },
      { property: "og:title", content: "Simple, Transparent Pricing | Nuva" },
      { property: "og:description", content: "No subscriptions, no hidden fees. Pay per booking with full price transparency." },
    ],
  }),
  component: Pricing,
});

const tiers = [
  {
    name: "Pay As You Go",
    price: "0",
    period: "no membership",
    desc: "Book premium housekeeping whenever you need it.",
    features: ["Verified professionals from $42/hr", "Secure escrow payments", "GPS-tracked appointments", "Encrypted messaging", "24/7 support"],
    cta: "Start booking",
    featured: false,
  },
  {
    name: "Nuva Plus",
    price: "19",
    period: "per month",
    desc: "For homes that deserve a standing appointment.",
    features: ["10% off every booking", "Priority access to top-rated providers", "Free cancellation anytime", "Dedicated concierge line", "Same-day booking guarantee", "Quarterly deep clean credit"],
    cta: "Get Nuva Plus",
    featured: true,
  },
  {
    name: "Nuva Estate",
    price: "Custom",
    period: "tailored service",
    desc: "Full household management for larger residences.",
    features: ["Dedicated household team", "Vetted recurring staff", "On-site quality manager", "Custom scheduling & SLAs", "Private account director"],
    cta: "Contact sales",
    featured: false,
  },
];

function Pricing() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-foreground">Pricing</p>
        <h1 className="mt-3 text-balance text-4xl font-bold sm:text-5xl">Transparent. Always.</h1>
        <p className="mt-4 text-muted-foreground">
          Providers set their own rates. Nuva adds a small service fee shown upfront at checkout —
          never a surprise.
        </p>
      </Reveal>
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <div
              className={`relative h-full rounded-4xl p-8 transition-all duration-500 hover:-translate-y-1 ${
                t.featured
                  ? "bg-primary text-primary-foreground shadow-lift"
                  : "border border-border bg-card shadow-soft"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-gradient-gold px-4 py-1 text-xs font-bold text-black">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold">{t.name}</h2>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight">
                  {t.price === "Custom" ? "Custom" : `$${t.price}`}
                </span>
                <span className={`text-sm ${t.featured ? "opacity-70" : "text-muted-foreground"}`}>{t.period}</span>
              </p>
              <p className={`mt-3 text-sm ${t.featured ? "opacity-80" : "text-muted-foreground"}`}>{t.desc}</p>
              <ul className="mt-7 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-gold" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to={t.name === "Nuva Estate" ? "/contact" : "/browse"}
                className={`mt-8 block rounded-full py-3.5 text-center text-sm font-semibold transition-all ${
                  t.featured
                    ? "bg-gradient-gold text-black shadow-gold hover:scale-[1.02]"
                    : "bg-primary text-primary-foreground hover:shadow-soft"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-16 max-w-2xl rounded-3xl bg-secondary p-8 text-center">
        <h3 className="font-semibold">For providers</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Joining Nuva is free. We charge a flat 15% platform fee per completed booking — covering
          payments, insurance, safety infrastructure, and client acquisition.
        </p>
        <Link to="/become-a-provider" className="mt-5 inline-block text-sm font-semibold text-gold-foreground underline underline-offset-4">
          Learn about earning with Nuva
        </Link>
      </Reveal>
    </div>
  );
}
