import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | Nuva" },
      { name: "description", content: "Answers about booking, payments, verification, cancellations, and safety on the Nuva premium housekeeping platform." },
      { property: "og:title", content: "Frequently Asked Questions | Nuva" },
      { property: "og:description", content: "Answers about booking, payments, verification, and safety on Nuva." },
    ],
  }),
  component: FAQ,
});

const faqs = [
  { q: "What exactly is the service?", a: "Nuva is a nude housekeeping marketplace. Verified professional housekeepers perform ordinary cleaning tasks — dusting, vacuuming, kitchens, bathrooms, laundry, tidying — while nude, as part of the service. That is the entire service." },
  { q: "Is this a sexual or adult-entertainment service?", a: "No. Nuva is strictly non-sexual. There is no touching, no sexual contact, no explicit content, and no escort services. Any request for, or offer of, sexual services results in immediate permanent removal from the platform and, where appropriate, referral to authorities. Both clients and providers agree to this code of conduct at signup." },
  { q: "What is a client not allowed to do during a booking?", a: "No touching, no sexual comments, no requests for sexual services, no photography or recording, and no removing of your own clothing beyond what is normal in your home. Housekeepers can end the appointment immediately if any boundary is crossed, with full payment protected and the client permanently banned." },
  { q: "How are housekeepers verified?", a: "Every professional completes government ID verification with biometric matching, a comprehensive criminal background check, and a professional reference review before their profile goes live. Verification is renewed annually. All providers are 18+." },
  { q: "How do payments work?", a: "You pay securely through the platform at booking. Funds are held in escrow and released to the professional only after your appointment is completed. We never share your payment details, and cash payments are not permitted." },
  { q: "What is your cancellation policy?", a: "Cancel free of charge up to 24 hours before your appointment. Cancellations within 24 hours incur a 50% fee to protect professionals' time. Nuva Plus members enjoy free cancellation anytime." },
  { q: "Is my personal information private?", a: "Yes. Your exact address is only revealed to a professional after a confirmed booking. All messaging happens in-app with encryption, and neither party ever sees the other's phone number or email." },
  { q: "What happens if something goes wrong during an appointment?", a: "Every appointment includes GPS check-in/out and an SOS button connected to our 24/7 trust & safety team. All bookings are covered by our damage protection guarantee up to $10,000." },
  { q: "Can I book the same professional regularly?", a: "Absolutely. After a completed booking you can set up weekly, bi-weekly, or monthly recurring appointments with the same professional at a locked-in rate." },
  { q: "How do I become a provider?", a: "Apply online in under 10 minutes. You'll complete identity verification (18+), a background check, and profile setup. You'll also review and sign our conduct policy confirming the service is strictly non-sexual. Most applicants are approved within 7 days." },
  { q: "What does Nuva cost providers?", a: "Joining is free. We charge a flat 15% fee on completed bookings, which covers payment processing, insurance, safety infrastructure, and marketing." },
];


function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-foreground">FAQ</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Questions, answered</h1>
      </Reveal>
      <div className="mt-14 space-y-3">
        {faqs.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.04}>
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-semibold">{f.q}</span>
                <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.25 }}>
                  <Plus className="h-5 w-5 shrink-0 text-gold" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-14 text-center">
        <p className="text-muted-foreground">Still have questions?</p>
        <Link to="/contact" className="mt-4 inline-block rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-lift">
          Contact support
        </Link>
      </Reveal>
    </div>
  );
}
