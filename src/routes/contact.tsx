import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Check, Headphones, Mail, MessageSquare } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — We're Here 24/7 | Nuva" },
      { name: "description", content: "Reach the Nuva support team any time. 24/7 assistance for clients and providers." },
      { property: "og:title", content: "Contact & Support | Nuva" },
      { property: "og:description", content: "Reach the Nuva support team any time — 24/7 assistance." },
    ],
  }),
  component: Contact,
});

interface FormValues {
  name: string;
  email: string;
  topic: string;
  message: string;
}

function Contact() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="grid gap-14 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-foreground">Support</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">We're here, around the clock</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Questions about a booking, verification, or payouts? Our human support team responds
            within minutes, 24 hours a day.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: Headphones, t: "24/7 phone support", d: "Priority line for active bookings" },
              { icon: MessageSquare, t: "In-app live chat", d: "Average response under 3 minutes" },
              { icon: Mail, t: "support@nuva.com", d: "Replies within a few hours" },
            ].map((c) => (
              <div key={c.t} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-soft">
                  <c.icon className="h-5 w-5 text-gold-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{c.t}</p>
                  <p className="text-sm text-muted-foreground">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center rounded-4xl border border-border bg-card p-12 text-center shadow-soft">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold shadow-gold">
                <Check className="h-7 w-7 text-black" />
              </div>
              <h2 className="mt-6 text-2xl font-bold">Message sent</h2>
              <p className="mt-2 text-muted-foreground">We'll get back to you shortly.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(() => setSent(true))}
              className="rounded-4xl border border-border bg-card p-8 shadow-soft"
              noValidate
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <input
                    id="name"
                    {...register("name", { required: "Please enter your name", maxLength: 100 })}
                    className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Please enter your email",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                    })}
                    className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="topic" className="text-sm font-medium">Topic</label>
                <select
                  id="topic"
                  {...register("topic")}
                  className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option>Booking question</option>
                  <option>Payments & invoices</option>
                  <option>Becoming a provider</option>
                  <option>Trust & safety</option>
                  <option>Something else</option>
                </select>
              </div>
              <div className="mt-5">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  {...register("message", { required: "Please write a message", maxLength: 1000 })}
                  className="mt-2 w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
                {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
              </div>
              <button
                type="submit"
                className="mt-7 w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-lift"
              >
                Send message
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
}
