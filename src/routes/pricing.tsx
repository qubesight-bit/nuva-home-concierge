import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import { useAuth } from "@/hooks/use-auth";
import { sendMembershipPaymentLink } from "@/lib/membership.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const PAYMENT_NOTICE =
  "In a few moments you will receive a link to process the payment";

function Pricing() {
  const { user } = useAuth();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function deliverPaymentLink(to: string) {
    setSending(true);
    try {
      await sendMembershipPaymentLink({ data: { email: to } });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not send the payment link email.";
      toast.error(message);
    } finally {
      setSending(false);
    }
  }

  function startNuvaPlusPayment() {
    toast.message(PAYMENT_NOTICE);

    const knownEmail = user?.email?.trim();
    if (knownEmail) {
      void deliverPaymentLink(knownEmail);
      return;
    }

    setEmailDialogOpen(true);
  }

  async function submitEmailForPayment(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setEmailDialogOpen(false);
    await deliverPaymentLink(trimmed);
  }

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
              {t.name === "Nuva Plus" ? (
                <button
                  type="button"
                  onClick={startNuvaPlusPayment}
                  disabled={sending}
                  className="mt-8 block w-full rounded-full bg-gradient-gold py-3.5 text-center text-sm font-semibold text-black shadow-gold transition-all hover:scale-[1.02] disabled:opacity-70"
                >
                  {sending ? "Sending…" : t.cta}
                </button>
              ) : (
                <Link
                  to={t.name === "Nuva Estate" ? "/contact" : "/browse"}
                  className="mt-8 block rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-primary-foreground transition-all hover:shadow-soft"
                >
                  {t.cta}
                </Link>
              )}
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

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Where should we send your payment link?</DialogTitle>
            <DialogDescription>
              Enter the email address where you want to receive the PayPal link for Nuva Plus.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEmailForPayment} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            <DialogFooter>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
              >
                {sending ? "Sending…" : "Send payment link"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
