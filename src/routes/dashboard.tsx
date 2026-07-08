import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  Heart,
  MessageSquare,
  CreditCard,
  Settings,
  Star,
  BadgeCheck,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { providers } from "@/lib/providers";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard | Nuva" },
      { name: "description", content: "Manage your bookings, saved providers, messages, and payments." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const tabs = [
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "saved", label: "Saved", icon: Heart },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

const upcoming = [
  { provider: providers[0], date: "Fri, Jul 11", time: "10:00", service: "Signature Clean", hours: 3, status: "Confirmed" },
  { provider: providers[4], date: "Tue, Jul 15", time: "09:00", service: "Deep Clean", hours: 5, status: "Pending" },
];
const past = [
  { provider: providers[1], date: "Jun 28", service: "Signature Clean", total: 156 },
  { provider: providers[0], date: "Jun 14", service: "Eco Luxe Clean", total: 168 },
  { provider: providers[3], date: "May 30", service: "Deep Clean", total: 248 },
];

function Dashboard() {
  const [tab, setTab] = useState<TabId>("bookings");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-bold sm:text-4xl">Welcome back, Alex</h1>
      <p className="mt-2 text-muted-foreground">Manage your bookings and account in one place.</p>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
            aria-pressed={tab === t.id}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {tab === "bookings" && (
          <div className="grid gap-10 lg:grid-cols-2">
            <section>
              <h2 className="text-lg font-bold">Upcoming</h2>
              <div className="mt-4 space-y-4">
                {upcoming.map((b) => (
                  <div key={b.date} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
                    <img src={b.provider.image} alt={b.provider.name} loading="lazy" width={768} height={960} className="h-16 w-16 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate font-semibold">
                        {b.provider.name} <BadgeCheck className="h-4 w-4 shrink-0 text-gold" />
                      </p>
                      <p className="text-sm text-muted-foreground">{b.service} · {b.hours}h</p>
                      <p className="text-sm text-muted-foreground">{b.date} at {b.time}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      b.status === "Confirmed" ? "bg-gold-soft text-gold-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-lg font-bold">Past bookings</h2>
              <div className="mt-4 space-y-3">
                {past.map((b, i) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={b.provider.image} alt={b.provider.name} loading="lazy" width={768} height={960} className="h-10 w-10 rounded-xl object-cover" />
                      <div>
                        <p className="text-sm font-semibold">{b.provider.name}</p>
                        <p className="text-xs text-muted-foreground">{b.service} · {b.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">${b.total}</span>
                      <button className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-accent">
                        <Star className="h-3 w-3" /> Rate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "saved" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                to="/providers/$id"
                params={{ id: p.id }}
                className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-lift"
              >
                <img src={p.image} alt={p.name} loading="lazy" width={768} height={960} className="h-16 w-16 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {p.rating.toFixed(2)} · ${p.rate}/hr
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        )}

        {tab === "messages" && (
          <div className="space-y-3">
            {[
              { p: providers[0], msg: "Perfect, I'll bring the eco products you requested. See you Friday!", time: "2h ago", unread: true },
              { p: providers[4], msg: "Thank you for the lovely review! Looking forward to next time.", time: "1d ago", unread: false },
            ].map((m) => (
              <button key={m.p.id} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:shadow-lift">
                <img src={m.p.image} alt={m.p.name} loading="lazy" width={768} height={960} className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{m.p.name}</p>
                    <span className="text-xs text-muted-foreground">{m.time}</span>
                  </div>
                  <p className={`truncate text-sm ${m.unread ? "font-medium" : "text-muted-foreground"}`}>{m.msg}</p>
                </div>
                {m.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gold" aria-label="Unread" />}
              </button>
            ))}
            <p className="pt-4 text-center text-xs text-muted-foreground">
              All messages are encrypted end-to-end.
            </p>
          </div>
        )}

        {tab === "invoices" && (
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            {past.map((b, i) => (
              <div key={i} className={`flex items-center justify-between px-6 py-4 ${i > 0 ? "border-t border-border" : ""}`}>
                <div>
                  <p className="text-sm font-semibold">Invoice #{2040 + i}</p>
                  <p className="text-xs text-muted-foreground">{b.service} — {b.provider.name} · {b.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">${b.total}</span>
                  <button className="rounded-full bg-secondary px-4 py-1.5 text-xs font-medium hover:bg-accent">Download PDF</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "payments" && (
          <div className="max-w-md space-y-4">
            <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-lift">
              <div className="flex items-center justify-between">
                <CreditCard className="h-6 w-6 text-gold" />
                <span className="text-xs font-medium opacity-70">Default</span>
              </div>
              <p className="mt-8 font-mono text-lg tracking-widest">•••• •••• •••• 4242</p>
              <div className="mt-4 flex justify-between text-xs opacity-70">
                <span>Alex Morgan</span>
                <span>09/28</span>
              </div>
            </div>
            <button className="w-full rounded-full border border-dashed border-border py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-gold hover:text-foreground">
              + Add payment method
            </button>
          </div>
        )}

        {tab === "settings" && (
          <div className="max-w-lg space-y-3">
            {["Profile information", "Notifications", "Privacy & security", "Identity verification", "Support"].map((s) => (
              <button key={s} className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-left text-sm font-medium transition-all hover:shadow-soft">
                {s}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
