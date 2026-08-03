import { useState } from "react";
import { ShieldCheck, Loader2, BadgeCheck, AlertTriangle } from "lucide-react";
import { createDiditSession } from "@/lib/didit.functions";

export function DiditVerifyCard({ approved }: { approved: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  async function start() {
    setErr(null);
    setBusy(true);
    try {
      const { url } = await createDiditSession();
      const { DiditSdk } = await import("@didit-protocol/sdk-web");
      DiditSdk.shared.onComplete = () => {
        // UI hint only — the signed webhook is the source of truth.
        setBusy(false);
      };
      DiditSdk.shared.startVerification({ url });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not start verification.");
    } finally {
      setBusy(false);
    }
  }

  if (approved) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-3xl bg-green-500/10 px-5 py-4 text-green-700 dark:text-green-400">
        <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Identity verified</p>
          <p className="text-sm opacity-90">Your identity and age have been confirmed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <div className="flex-1">
          <p className="font-semibold">Verify your identity &amp; age instantly</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete a secure ID + liveness check with our verification partner, Didit. Your
            document and selfie are processed by Didit for identity, age (18+) and compliance
            screening, and Nuva only receives the pass/fail decision. Nothing is shared with
            clients or providers.
          </p>

          <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
            />
            <span>
              I consent to Didit processing my ID document and biometric data for identity and
              age verification.
            </span>
          </label>

          {err && (
            <p className="mt-3 flex items-center gap-2 text-xs text-destructive" role="alert">
              <AlertTriangle className="h-3.5 w-3.5" /> {err}
            </p>
          )}

          <button
            onClick={start}
            disabled={busy || !consent}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-lift disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify my identity
          </button>
        </div>
      </div>
    </div>
  );
}
