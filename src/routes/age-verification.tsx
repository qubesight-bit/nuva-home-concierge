import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/age-verification")({
  head: () => ({
    meta: [
      { title: "Age Verification Policy | Nuva" },
      { name: "description", content: "How Nuva verifies that users are 18 years or older." },
    ],
  }),
  component: AgeVerification,
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
    t: "Platform Intent",
    paragraphs: [
      "Nuva is intended solely for adults aged 18 years or older.",
    ],
  },
  {
    t: "Verification Requirements",
    paragraphs: [
      "All users who create an account may be required to verify their age. Providers must complete identity and age verification before offering services.",
    ],
  },
  {
    t: "Accepted Verification",
    intro: "Accepted verification may include:",
    bullets: [
      "Government-issued photo identification",
      "Selfie or biometric verification",
      "Additional documentation when required",
    ],
  },
  {
    t: "False Information",
    paragraphs: [
      "Providing false age or identity information is prohibited and may result in immediate account termination.",
    ],
  },
  {
    t: "Record Retention",
    paragraphs: [
      "Verification records may be retained for compliance, fraud prevention, and legal obligations.",
    ],
  },
  {
    t: "Underage Users",
    paragraphs: [
      "If Nuva becomes aware that a user is under 18, the account will be suspended and associated data may be deleted as required by law.",
    ],
  },
];

function AgeVerification() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="text-4xl font-bold">Age Verification Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Effective Date: July 8, 2026
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
      </div>
    </div>
  );
}
