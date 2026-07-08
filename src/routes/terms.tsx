import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Nuva" },
      { name: "description", content: "The terms governing use of the Nuva housekeeping marketplace." },
    ],
  }),
  component: Terms,
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
    t: "1. Acceptance of Terms",
    paragraphs: [
      "By accessing or using Nuva (\u201CPlatform\u201D), you agree to be bound by these Terms of Service (\u201CTerms\u201D). If you do not agree, do not use the Platform.",
    ],
  },
  {
    t: "2. Eligibility",
    paragraphs: [
      "You must be at least 18 years old to create an account, book services, or offer services on the Platform.",
    ],
  },
  {
    t: "3. Nature of the Service",
    paragraphs: [
      "Nuva is an online marketplace that connects independent service providers (\u201CProviders\u201D) with clients (\u201CClients\u201D) for housekeeping and related domestic services.",
      "Nuva is not a party to any service agreement between a Provider and a Client.",
    ],
  },
  {
    t: "4. Independent Providers",
    intro: "Providers are independent contractors and are not employees, agents, or representatives of Nuva. Providers are solely responsible for:",
    bullets: [
      "The services they offer;",
      "Compliance with applicable laws;",
      "Taxes and reporting obligations;",
      "Their conduct during appointments.",
    ],
  },
  {
    t: "5. Prohibited Conduct",
    intro: "Users may not:",
    bullets: [
      "Offer or request illegal services;",
      "Engage in harassment, coercion, threats, or violence;",
      "Use the Platform for prostitution, solicitation, trafficking, or any unlawful activity;",
      "Misrepresent identity, age, or qualifications;",
      "Share another person\u2019s private information without consent.",
    ],
    outro: "Nuva reserves the right to suspend or terminate accounts for violations.",
  },
  {
    t: "6. Bookings and Payments",
    bullets: [
      "All payments must be processed through approved payment methods.",
      "Prices are determined by Providers unless otherwise stated.",
      "Platform fees may apply.",
      "Refunds and cancellations are subject to the applicable cancellation policy.",
    ],
  },
  {
    t: "7. Verification",
    paragraphs: [
      "Nuva may require identity verification, age verification, and other compliance checks before allowing access to certain features.",
    ],
  },
  {
    t: "8. Safety",
    paragraphs: [
      "Clients and Providers are expected to maintain a respectful environment. Nuva may provide safety features such as check-ins, emergency alerts, or verification tools, but does not guarantee the safety of any interaction.",
    ],
  },
  {
    t: "9. Intellectual Property",
    paragraphs: [
      "All Platform content, branding, logos, and software are owned by Nuva or its licensors.",
    ],
  },
  {
    t: "10. Limitation of Liability",
    intro: "To the maximum extent permitted by law, Nuva shall not be liable for:",
    bullets: [
      "Actions of Clients or Providers;",
      "Personal injury;",
      "Property damage;",
      "Loss of profits;",
      "Indirect or consequential damages.",
    ],
  },
  {
    t: "11. Indemnification",
    paragraphs: [
      "You agree to indemnify and hold Nuva harmless from claims arising from your use of the Platform or violation of these Terms.",
    ],
  },
  {
    t: "12. Termination",
    paragraphs: [
      "Nuva may suspend or terminate any account at its discretion for violations of these Terms or applicable law.",
    ],
  },
  {
    t: "13. Governing Law",
    paragraphs: [
      "These Terms are governed by the laws of the Republic of Costa Rica.",
    ],
  },
];

function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Effective Date: July 8, 2036 &middot; Last Updated: July 8, 2036
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
          <h2 className="text-lg font-semibold">14. Contact</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            For legal notices or support:
          </p>
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
