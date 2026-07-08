import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import {
  ShieldCheck,
  BadgeCheck,
  Lock,
  MapPin,
  MessageSquare,
  Star,
  Headphones,
  Fingerprint,
  Siren,
  KeyRound,
  CreditCard,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import heroImage from "@/assets/hero-interior.jpg";
import { providers } from "@/lib/providers";
import ProviderCard from "@/components/site/ProviderCard";
import { Reveal, Counter } from "@/components/site/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nuva — Premium Nude Housekeeping. Strictly Non-Sexual." },
      {
        name: "description",
        content:
          "Nuva is a professional nude housekeeping marketplace — verified housekeepers work in the nude as part of the service. Strictly non-sexual, zero-tolerance conduct policy, secure and private.",
      },

    ],
  }),
  component: Index,
});

const steps = [
  { n: "01", title: "Choose your location", desc: "Tell us where you need service — city, neighborhood, or exact address." },
  { n: "02", title: "Browse verified professionals", desc: "Every profile is identity-verified and background-checked." },
  { n: "03", title: "Select date & time", desc: "Real-time availability with instant booking on select providers." },
  { n: "04", title: "Secure payment", desc: "Encrypted checkout. Funds are held until service is complete." },
  { n: "05", title: "Enjoy premium housekeeping", desc: "GPS check-in, live status, and a spotless home." },
];

const features = [
  { icon: BadgeCheck, title: "Verified Professionals", desc: "Every housekeeper passes multi-step identity verification." },
  { icon: ShieldCheck, title: "Background Checks", desc: "Comprehensive screening before anyone joins the platform." },
  { icon: CreditCard, title: "Secure Payments", desc: "PCI-compliant checkout with funds held in escrow." },
  { icon: MapPin, title: "GPS-Tracked Appointments", desc: "Check-in and check-out confirmations on every visit." },
  { icon: MessageSquare, title: "Private Messaging", desc: "Communicate without ever sharing personal contact details." },
  { icon: Star, title: "Ratings & Reviews", desc: "Transparent, verified reviews from real completed bookings." },
  { icon: Headphones, title: "24/7 Support", desc: "A real human, any hour, for clients and providers alike." },
  { icon: Fingerprint, title: "Identity Verification", desc: "Government ID verification for both sides of every booking." },
  { icon: Siren, title: "Emergency Safety", desc: "One-tap SOS with live location sharing during appointments." },
  { icon: KeyRound, title: "Encrypted Communications", desc: "End-to-end protection for messages and personal data." },
];

function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative flex min-h-[92svh] items-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0">
          <img
            src={heroImage}
            alt="Immaculate luxury living room cared for by Nuva professionals"
            width={1920}
            height={1152}
            className="h-full w-full scale-110 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        </motion.div>
        <motion.div style={{ opacity }} className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Nude housekeeping · Strictly non-sexual
            </span>
            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Premium Nude Housekeeping.{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">A Professional Service.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              Nuva connects you with verified professional housekeepers who work in the nude as
              part of the service. It is a cleaning service — strictly non-sexual, with a
              zero-tolerance code of conduct enforced on every booking.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/browse"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-8 py-4 text-base font-semibold text-black shadow-gold transition-all duration-300 hover:scale-[1.02]"
              >
                Book Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/become-a-provider"
                className="inline-flex items-center justify-center rounded-full glass px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/20"
              >
                Become a Housekeeper
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-16 sm:px-6 md:grid-cols-4">
          {[
            { to: 12400, suffix: "+", label: "Happy households" },
            { to: 860, suffix: "+", label: "Verified professionals" },
            { to: 98, suffix: "%", label: "5-star experiences" },
            { to: 42, suffix: "", label: "Cities covered" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <p className="text-4xl font-bold tracking-tight sm:text-5xl">
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-foreground">How it works</p>
          <h2 className="mt-3 text-balance text-3xl font-bold sm:text-5xl">
            Five steps to a flawless home
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="h-full rounded-3xl bg-card p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                <span className="bg-gradient-gold bg-clip-text text-3xl font-bold text-transparent">{s.n}</span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured providers */}
      <section className="bg-secondary/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-gold-foreground">Marketplace</p>
              <h2 className="mt-3 text-3xl font-bold sm:text-5xl">Meet our professionals</h2>
            </div>
            <Link
              to="/browse"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold shadow-soft transition-all hover:shadow-lift"
            >
              Browse all providers
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {providers.slice(0, 3).map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <ProviderCard provider={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-foreground">Why Nuva</p>
          <h2 className="mt-3 text-balance text-3xl font-bold sm:text-5xl">
            Built on trust, engineered for safety
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every layer of the platform is designed to protect both clients and professionals.
          </p>
        </Reveal>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 5) * 0.06}>
              <div className="h-full rounded-3xl border border-border bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-soft">
                  <f.icon className="h-5 w-5 text-gold-foreground" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Safety band */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 sm:pb-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-primary px-8 py-16 text-primary-foreground sm:px-16 sm:py-20">
            <div
              className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20"
              style={{ background: "var(--gradient-gold)", filter: "blur(80px)" }}
              aria-hidden
            />
            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <Lock className="h-8 w-8 text-gold" />
                <h2 className="mt-5 text-balance text-3xl font-bold sm:text-4xl">
                  Discretion isn't a feature. It's the foundation.
                </h2>
                <p className="mt-4 max-w-md leading-relaxed opacity-80">
                  Age-verified members, government ID checks, GPS-tracked appointments, encrypted
                  messaging, and a one-tap SOS system — privacy and safety at every step.
                </p>
                <Link
                  to="/safety"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-black shadow-gold transition-transform hover:scale-[1.02]"
                >
                  Explore safety features <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {["18+ age verification", "Government ID checks", "SOS emergency button", "GPS check-in / check-out", "Fraud detection", "Secure messaging"].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-4 py-3.5 text-sm backdrop-blur-sm"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-secondary/50">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 sm:py-28">
          <Reveal>
            <h2 className="text-balance text-3xl font-bold sm:text-5xl">
              Your home deserves the Nuva standard
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join thousands of households enjoying effortless, discreet, five-star housekeeping.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/browse"
                className="rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-lift"
              >
                Book your first clean
              </Link>
              <Link
                to="/become-a-provider"
                className="rounded-full border border-border bg-card px-8 py-4 text-base font-semibold transition-all hover:shadow-soft"
              >
                Earn with Nuva
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
