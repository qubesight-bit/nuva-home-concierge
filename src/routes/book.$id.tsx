import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, Lock, Star } from "lucide-react";
import { getCountry, getProvider, SERVICES, EXTRAS } from "@/lib/providers";
import { browseSearchValidator, safeCategory } from "@/lib/browse-search";

export const Route = createFileRoute("/book/$id")({
  validateSearch: browseSearchValidator,
  loader: ({ params }) => {
    const provider = getProvider(params.id);
    if (!provider) throw notFound();
    return { provider };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Book ${loaderData.provider.name} | Nuva` : "Booking | Nuva" },
      { name: "description", content: "Secure, private booking with encrypted payment on Nuva." },
      { name: "robots", content: "noindex" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="text-3xl font-bold">Provider not found</h1>
      <Link to="/browse" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
        Browse providers
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <Link to="/browse" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
        Browse providers
      </Link>
    </div>
  ),
  component: BookingFlow,
});


const stepLabels = ["Service", "Date & time", "Extras", "Review"];
const times = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

function BookingFlow() {
  const { provider } = Route.useLoaderData();
  const search = Route.useSearch();
  const activeCategory = safeCategory(search.category);
  const activeCountry = search.country ? getCountry(search.country) : undefined;
  const hasFilter = !!activeCountry || activeCategory !== "all";
  const [step, setStep] = useState(0);

  const [service, setService] = useState<string>(SERVICES[0].id);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [duration, setDuration] = useState(3);
  const [extras, setExtras] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  const days = useMemo(() => nextDays(10), []);
  const selectedService = SERVICES.find((s) => s.id === service)!;
  const extrasTotal = extras.reduce((sum, id) => sum + (EXTRAS.find((e) => e.id === id)?.price ?? 0), 0);
  const hourly = provider.rate + selectedService.perHour;
  const total = hourly * duration + extrasTotal;

  const canContinue =
    step === 0 ? !!service : step === 1 ? !!date && !!time : true;

  if (confirmed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:py-32">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold shadow-gold"
        >
          <Check className="h-9 w-9 text-black" />
        </motion.div>
        <h1 className="mt-8 text-3xl font-bold">Booking confirmed</h1>
        <p className="mt-3 text-muted-foreground">
          {provider.name} will see you on {date} at {time}. A confirmation and receipt have been
          sent to your inbox.
        </p>
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 text-left shadow-soft">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Service</span><span className="font-medium">{selectedService.name}</span></div>
          <div className="mt-2 flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="font-medium">{duration} hours</span></div>
          <div className="mt-2 flex justify-between text-sm"><span className="text-muted-foreground">Total paid</span><span className="font-bold">${total}</span></div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/dashboard" className="rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground">
            View in dashboard
          </Link>
          <Link
            to="/browse"
            search={{ country: search.country, category: search.category }}
            className="rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold"
          >
            Browse more
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        to="/providers/$id"
        params={{ id: provider.id }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>

      {/* Progress */}
      <div className="mt-8 flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-2">
            <div className={`h-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-gradient-gold" : "bg-secondary"}`} />
            <span className={`text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <div>
                  <h1 className="text-2xl font-bold">Choose your service</h1>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {SERVICES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setService(s.id)}
                        className={`rounded-3xl border-2 p-6 text-left transition-all duration-300 ${
                          service === s.id
                            ? "border-gold bg-gold-soft shadow-gold"
                            : "border-border bg-card hover:border-gold/40"
                        }`}
                      >
                        <p className="font-semibold">{s.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                        <p className="mt-3 text-sm font-semibold text-gold-foreground">
                          ${provider.rate + s.perHour}/hr
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h1 className="text-2xl font-bold">Pick date, time & duration</h1>
                  <p className="mt-5 text-sm font-semibold">Date</p>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {days.map((d) => {
                      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                      return (
                        <button
                          key={label}
                          onClick={() => setDate(label)}
                          className={`shrink-0 rounded-2xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                            date === label ? "border-gold bg-gold-soft" : "border-border bg-card hover:border-gold/40"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-6 text-sm font-semibold">Start time</p>
                  <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
                    {times.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTime(t)}
                        className={`rounded-xl border-2 py-2.5 text-sm font-medium transition-all ${
                          time === t ? "border-gold bg-gold-soft" : "border-border bg-card hover:border-gold/40"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <p className="mt-6 text-sm font-semibold">Duration — {duration} hours</p>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    aria-label="Duration in hours"
                    className="mt-3 w-full accent-[var(--gold)]"
                  />
                </div>
              )}

              {step === 2 && (
                <div>
                  <h1 className="text-2xl font-bold">Add extras</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Optional add-ons at a fixed price.</p>
                  <div className="mt-6 space-y-3">
                    {EXTRAS.map((e) => {
                      const on = extras.includes(e.id);
                      return (
                        <button
                          key={e.id}
                          onClick={() => setExtras(on ? extras.filter((x) => x !== e.id) : [...extras, e.id])}
                          className={`flex w-full items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                            on ? "border-gold bg-gold-soft" : "border-border bg-card hover:border-gold/40"
                          }`}
                        >
                          <span className="flex items-center gap-3 text-sm font-medium">
                            <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${on ? "border-gold bg-gradient-gold" : "border-border"}`}>
                              {on && <Check className="h-3 w-3 text-black" />}
                            </span>
                            {e.name}
                          </span>
                          <span className="text-sm font-semibold">+${e.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h1 className="text-2xl font-bold">Review & pay</h1>
                  <div className="mt-6 space-y-3 rounded-3xl border border-border bg-card p-6">
                    <Row label="Provider" value={provider.name} />
                    <Row label="Service" value={selectedService.name} />
                    <Row label="Date" value={date || "—"} />
                    <Row label="Time" value={time || "—"} />
                    <Row label="Duration" value={`${duration} hours`} />
                    {extras.length > 0 && (
                      <Row label="Extras" value={extras.map((id) => EXTRAS.find((e) => e.id === id)?.name).join(", ")} />
                    )}
                    <div className="border-t border-border pt-3">
                      <Row label="Total" value={`$${total}`} bold />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-secondary px-5 py-4 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 shrink-0 text-gold" />
                    Payments are encrypted and held securely until your service is completed.
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-all enabled:hover:shadow-soft disabled:opacity-40"
            >
              Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canContinue}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all enabled:hover:shadow-lift disabled:opacity-40"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setConfirmed(true)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-3 text-sm font-semibold text-black shadow-gold transition-transform hover:scale-[1.02]"
              >
                <Lock className="h-4 w-4" /> Confirm & pay ${total}
              </button>
            )}
          </div>
        </div>

        {/* Summary card */}
        <aside className="order-first lg:order-none">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
            <div className="flex items-center gap-4">
              <img
                src={provider.image}
                alt={provider.name}
                loading="lazy"
                width={768}
                height={960}
                className="h-16 w-16 rounded-2xl object-cover"
              />
              <div>
                <p className="flex items-center gap-1.5 font-semibold">
                  {provider.name} <BadgeCheck className="h-4 w-4 text-gold" />
                </p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {provider.rating.toFixed(2)} · {provider.location}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
              <Row label={`$${hourly}/hr × ${duration}h`} value={`$${hourly * duration}`} />
              {extrasTotal > 0 && <Row label="Extras" value={`$${extrasTotal}`} />}
              <div className="border-t border-border pt-2">
                <Row label="Total" value={`$${total}`} bold />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`text-sm ${bold ? "font-bold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm ${bold ? "text-lg font-bold" : "font-medium"}`}>{value}</span>
    </div>
  );
}
