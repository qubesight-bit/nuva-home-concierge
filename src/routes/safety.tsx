import { createFileRoute } from "@tanstack/react-router";
import { Fingerprint, MapPin, ShieldCheck, Siren, Lock, UserCheck, Radar, IdCard, Eye, MessageSquare } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety & Trust — How Nuva Protects You | Nuva" },
      { name: "description", content: "Age verification, government ID checks, background screening, GPS tracking, SOS support, and encrypted messaging. Safety is engineered into every booking." },
      { property: "og:title", content: "Safety & Trust — How Nuva Protects You" },
      { property: "og:description", content: "Safety is engineered into every booking on Nuva." },
    ],
  }),
  component: Safety,
});

const pillars = [
  { icon: IdCard, title: "Age verification (18+)", desc: "Every member — client and professional — must verify they are 18 or older before using the platform." },
  { icon: Fingerprint, title: "Government ID verification", desc: "Biometric-matched government ID checks on both sides of every booking." },
  { icon: ShieldCheck, title: "Background checks", desc: "Comprehensive criminal background screening for all professionals, renewed annually." },
  { icon: Siren, title: "SOS emergency button", desc: "One tap alerts our 24/7 trust & safety team and shares live location with emergency contacts." },
  { icon: MapPin, title: "GPS check-in & check-out", desc: "Every appointment is confirmed with location-verified arrival and departure." },
  { icon: Radar, title: "Appointment tracking", desc: "Optional live status during appointments, visible to you and our safety team." },
  { icon: UserCheck, title: "Customer verification", desc: "Clients are identity-verified too — professionals always know who they're meeting." },
  { icon: MessageSquare, title: "Secure messaging", desc: "All communication stays in-app, encrypted, with no personal contact details exposed." },
  { icon: Eye, title: "Fraud detection", desc: "Machine-learning systems monitor for suspicious activity around the clock." },
  { icon: Lock, title: "Encrypted data", desc: "Personal data, payments, and messages protected with bank-grade encryption." },
];

function Safety() {
  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <Reveal>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-gold shadow-gold">
              <ShieldCheck className="h-8 w-8 text-black" />
            </div>
            <h1 className="mt-8 text-balance text-4xl font-bold sm:text-6xl">
              Safety isn't a promise. It's infrastructure.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg opacity-80">
              Nuva was built from day one around the safety of both clients and professionals —
              with verification, tracking, and human support at every layer.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 0.07}>
              <div className="h-full rounded-3xl border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft">
                  <p.icon className="h-5 w-5 text-gold-foreground" />
                </div>
                <h2 className="mt-5 font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 text-center sm:px-6">
        <Reveal>
          <div className="rounded-4xl bg-secondary p-10">
            <h2 className="text-2xl font-bold">What Nuva is — and what it isn't</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Nuva is a <strong>professional nude housekeeping</strong> marketplace. Housekeepers
              perform ordinary cleaning tasks — dusting, vacuuming, kitchens, bathrooms, laundry —
              while nude, as part of the service. That is where the service begins and ends.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Nuva is <strong>strictly non-sexual</strong>. There is no touching, no sexual
              contact, no explicit content, and no escort or adult-entertainment services offered
              on this platform. Any request for, or offer of, sexual services — from either side —
              results in immediate permanent removal and, where appropriate, referral to
              authorities. Discretion means privacy. It never means compromise.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

