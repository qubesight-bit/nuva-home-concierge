import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Nuva" },
      { name: "description", content: "How Nuva collects, uses, and protects your personal information." },
    ],
  }),
  component: Privacy,
});

const sections = [
  { t: "1. Information we collect", c: "We collect information you provide when creating an account (name, email, verified identity documents), booking details, payment information processed by our secure payment partners, and usage data that helps us improve the platform. Location data is collected only during active appointments for GPS check-in/check-out and safety features." },
  { t: "2. How we use your information", c: "Your information is used to operate the marketplace: matching clients with professionals, processing secure payments, verifying identities, providing safety features, and offering customer support. We never sell your personal data to third parties." },
  { t: "3. Privacy by design", c: "Your exact address is shared with a professional only after a confirmed booking. Phone numbers and email addresses are never exposed between members — all communication happens through encrypted in-app messaging." },
  { t: "4. Data security", c: "All data is encrypted in transit and at rest using industry-standard protocols. Identity documents are stored with additional encryption and access controls, and are automatically purged when no longer required by law." },
  { t: "5. Your rights", c: "You may access, correct, export, or delete your personal data at any time from your account settings or by contacting privacy@nuva.com. We respond to all requests within 30 days." },
  { t: "6. Cookies & analytics", c: "We use essential cookies for authentication and privacy-respecting analytics to understand how the platform is used. You can manage preferences in your browser settings." },
  { t: "7. Contact", c: "For privacy questions or requests, contact our Data Protection team at privacy@nuva.com." },
];

function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
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
