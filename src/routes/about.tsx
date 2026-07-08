import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal, Counter } from "@/components/site/Reveal";
import heroImage from "@/assets/hero-interior.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Nuva — Redefining Premium Housekeeping" },
      { name: "description", content: "Nuva connects verified professional housekeepers with clients who value quality, privacy, and trust. Learn about our mission and values." },
      { property: "og:title", content: "About Nuva — Redefining Premium Housekeeping" },
      { property: "og:description", content: "Our mission: make premium housekeeping effortless, safe, and dignified for everyone involved." },
    ],
  }),
  component: About,
});

const values = [
  { title: "Discretion", desc: "Privacy is engineered into everything — from anonymized messaging to address protection." },
  { title: "Dignity", desc: "Housekeeping is a skilled profession. We built Nuva to treat it that way, with fair pay and respect." },
  { title: "Excellence", desc: "Five-star standards, hotel-grade training resources, and quality feedback loops on every booking." },
  { title: "Safety", desc: "Verification, tracking, and 24/7 human support protect both sides of every appointment." },
];

function About() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-foreground">Our story</p>
          <h1 className="mt-3 text-balance text-4xl font-bold sm:text-6xl">
            The standard homes deserve. The respect professionals earn.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Nuva was founded on a simple belief: booking exceptional housekeeping should feel as
            effortless and trustworthy as staying at a five-star hotel — and the professionals
            delivering it deserve a platform built around their safety, earnings, and dignity.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="overflow-hidden rounded-4xl shadow-lift">
            <img src={heroImage} alt="A pristine home cared for through Nuva" width={1920} height={1152} loading="lazy" className="h-[420px] w-full object-cover" />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-3 gap-8 px-4 py-20 sm:px-6">
        {[
          { to: 42, suffix: "", label: "Cities" },
          { to: 860, suffix: "+", label: "Professionals" },
          { to: 120000, suffix: "+", label: "Bookings completed" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <p className="text-3xl font-bold sm:text-5xl"><Counter to={s.to} suffix={s.suffix} /></p>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </Reveal>
        ))}
      </section>

      <section className="bg-secondary/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">What we stand for</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="h-full rounded-3xl bg-card p-7 shadow-soft">
                  <h3 className="bg-gradient-gold bg-clip-text text-lg font-bold text-transparent">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-bold">Join us</h2>
          <p className="mt-4 text-muted-foreground">Whether you're booking your first clean or building your career, there's a place for you at Nuva.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/browse" className="rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-lift">Book a professional</Link>
            <Link to="/become-a-provider" className="rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold hover:shadow-soft">Become a provider</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
