import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Nuva" },
      { name: "description", content: "The terms governing use of the Nuva premium housekeeping marketplace." },
    ],
  }),
  component: Terms,
});

const sections = [
  { t: "1. The platform", c: "Nuva is a marketplace connecting clients with independent professional housekeepers. Nuva facilitates discovery, booking, secure payment, and safety infrastructure, but professionals operate as independent contractors." },
  { t: "2. Eligibility", c: "All members must be at least 18 years old and complete identity verification. Professionals must additionally pass a background check before offering services." },
  { t: "3. Bookings & payments", c: "All bookings and payments must be made through the platform. Funds are held in escrow and released to professionals upon service completion. Off-platform payment arrangements are prohibited and result in account termination." },
  { t: "4. Cancellations", c: "Bookings may be cancelled free of charge up to 24 hours before the appointment. Later cancellations incur a fee of 50% of the booking value, paid to the professional." },
  { t: "5. Code of conduct", c: "Nuva is a professional services platform. Harassment, discrimination, solicitation of non-housekeeping services, or any behavior compromising member safety or dignity results in immediate permanent removal and may be reported to authorities." },
  { t: "6. Damage protection", c: "Completed bookings include damage protection up to $10,000 subject to claim review. Claims must be submitted within 72 hours of appointment completion." },
  { t: "7. Liability", c: "Nuva provides the marketplace and safety infrastructure but is not a party to the service agreement between client and professional. To the maximum extent permitted by law, Nuva's liability is limited to the value of the relevant booking." },
  { t: "8. Changes", c: "We may update these terms with 30 days' notice. Continued use of the platform constitutes acceptance of updated terms." },
];

function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: July 2026</p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.t}>
            <h2 className="text-lg font-semibold">{s.t}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.c}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
