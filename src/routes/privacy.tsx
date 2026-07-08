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

type Section = {
  t: string;
  paragraphs?: string[];
  intro?: string;
  bullets?: string[];
  outro?: string;
};

const sections: Section[] = [
  {
    t: "1. Information We Collect",
    intro: "We may collect:",
    bullets: [
      "Name",
      "Email address",
      "Phone number",
      "Government-issued identification (for verification)",
      "Payment information (processed by third-party processors)",
      "Location data",
      "Booking history",
      "Messages exchanged through the Platform",
      "Device and usage information",
    ],
  },
  {
    t: "2. How We Use Information",
    intro: "We use information to:",
    bullets: [
      "Create and manage accounts",
      "Verify age and identity",
      "Process bookings and payments",
      "Provide customer support",
      "Improve the Platform",
      "Detect fraud and abuse",
      "Comply with legal obligations",
    ],
  },
  {
    t: "3. Legal Basis",
    intro: "Where applicable, we process personal data based on:",
    bullets: [
      "User consent",
      "Performance of a contract",
      "Compliance with legal obligations",
      "Legitimate business interests",
    ],
  },
  {
    t: "4. Sharing of Information",
    intro: "We may share information with:",
    bullets: [
      "Payment processors",
      "Identity verification providers",
      "Customer support providers",
      "Law enforcement when required by law",
    ],
    outro: "We do not sell personal information to advertisers.",
  },
  {
    t: "5. Age Restrictions",
    paragraphs: [
      "The Platform is intended only for adults aged 18 and older. We do not knowingly collect information from minors.",
    ],
  },
  {
    t: "6. Data Retention",
    intro: "We retain personal information only as long as necessary for:",
    bullets: [
      "Providing services",
      "Legal compliance",
      "Dispute resolution",
      "Fraud prevention",
    ],
  },
  {
    t: "7. Security",
    paragraphs: [
      "We implement reasonable administrative, technical, and physical safeguards to protect personal information. However, no system is completely secure.",
    ],
  },
  {
    t: "8. Your Rights",
    intro: "Subject to applicable law, you may have the right to:",
    bullets: [
      "Access your data",
      "Correct inaccurate data",
      "Request deletion",
      "Withdraw consent",
      "Object to certain processing activities",
    ],
    outro: "Requests may be submitted to: nuvacrc@gmail.com",
  },
  {
    t: "9. Cookies",
    intro: "We use cookies and similar technologies to:",
    bullets: [
      "Maintain sessions",
      "Remember preferences",
      "Analyze traffic",
      "Improve functionality",
    ],
  },
  {
    t: "10. International Transfers",
    paragraphs: [
      "If data is processed outside Costa Rica, we will take reasonable steps to ensure appropriate protections are in place.",
    ],
  },
  {
    t: "11. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. Continued use of the Platform after changes constitutes acceptance of the updated policy.",
    ],
  },
];

function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Effective Date: July 8, 2026 &middot; Last Updated: July 8, 2026
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.t}>
            <h2 className="text-lg font-semibold">{s.t}</h2>
            {s.paragraphs?.map((p, i) => (
              <p key={i} className="mt-2 leading-relaxed text-muted-foreground">{p}</p>
            ))}
            {s.intro && (
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.intro}</p>
            )}
            {s.bullets && (
              <ul className="mt-2 list-disc space-y-1 pl-6 leading-relaxed text-muted-foreground">
                {s.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
            {s.outro && (
              <p className="mt-3 leading-relaxed text-muted-foreground">{s.outro}</p>
            )}
          </section>
        ))}

        <section>
          <h2 className="text-lg font-semibold">12. Contact</h2>
          <address className="mt-2 not-italic leading-relaxed text-muted-foreground">
            Email:{" "}
            <a href="mailto:nuvacrc@gmail.com" className="underline underline-offset-2 hover:text-foreground">
              nuvacrc@gmail.com
            </a>
            <br />
            Address: A032A Curridabat, San Jos&eacute;, Costa Rica
          </address>
        </section>
      </div>
    </div>
  );
}
