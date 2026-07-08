import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Banknote, CalendarClock, ShieldCheck, TrendingUp, Wallet, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-interior.jpg";
import { Reveal, Counter } from "@/components/site/Reveal";

export const Route = createFileRoute("/become-a-provider")({
  head: () => ({
    meta: [
      { title: "Become a Housekeeper — Earn on Your Terms | Nuva" },
      { name: "description", content: "Join Nuva as a verified professional housekeeper. Set your rates, control your schedule, and get paid securely with weekly payouts." },
      { property: "og:title", content: "Become a Housekeeper — Earn on Your Terms | Nuva" },
      { property: "og:description", content: "Set your rates, control your schedule, and get paid securely." },
    ],
  }),
  component: BecomeProvider,
});

const perks = [
  { icon: Wallet, title: "Keep more of what you earn", desc: "Industry-low 15% platform fee. You set your own hourly rate." },
  { icon: CalendarClock, title: "Total schedule control", desc: "Work when you want. Block dates, set recurring availability." },
  { icon: Banknote, title: "Weekly secure payouts", desc: "Direct deposits every week, powered by secure payment rails." },
  { icon: ShieldCheck, title: "Safety on every job", desc: "GPS check-in, verified clients, SOS support, and insurance coverage." },
  { icon: BadgeCheck, title: "Verified badge", desc: "Stand out with identity verification and background-check badges." },
  { icon: TrendingUp, title: "Grow your business", desc: "Income analytics, performance metrics, and repeat-client tools." },
];

const steps = [
  { n: "1", t: "Apply online", d: "Tell us about your experience — takes under 10 minutes." },
  { n: "2", t: "Verify your identity", d: "Government ID verification and background check (18+ required)." },
  { n: "3", t: "Build your profile", d: "Photos, services, rates, and availability. We'll help polish it." },
  { n: "4", t: "Start earning", d: "Go live, accept bookings, and get paid weekly." },
];

function BecomeProvider() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <img src={heroImage} alt="Luxury home cared for by Nuva professionals" width={1920} height={1152} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36">
          <div className="max-w-2xl">
            <h1 className="text-balance text-4xl font-bold text-white sm:text-6xl">
              Turn your expertise into a <span className="bg-gradient-gold bg-clip-text text-transparent">premium career</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/85">
              Join hundreds of professionals earning on their own terms — with the safety,
              tools, and clientele of a world-class platform.
            </p>
            <Link
              to="/auth"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-4 text-base font-semibold text-black shadow-gold transition-transform hover:scale-[1.02]"
            >
              Apply now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-4 py-14 sm:px-6">
          {[
            { to: 3200, suffix: "", label: "Avg. monthly earnings ($)" },
            { to: 92, suffix: "%", label: "Providers with repeat clients" },
            { to: 7, suffix: " days", label: "Average approval time" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <p className="text-3xl font-bold sm:text-4xl"><Counter to={s.to} suffix={s.suffix} /></p>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-5xl">Why professionals choose Nuva</h2>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {perks.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 0.08}>
              <div className="h-full rounded-3xl border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft">
                  <p.icon className="h-5 w-5 text-gold-foreground" />
                </div>
                <h3 className="mt-5 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary/50 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Getting started is simple</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="h-full rounded-3xl bg-card p-6 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-sm font-bold text-black">{s.n}</span>
                  <h3 className="mt-4 font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14 text-center">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-lift"
            >
              Start your application <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
