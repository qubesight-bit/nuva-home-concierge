import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";

/** Whole-number floats (1.0) -> integers (1), recursively. */
function shortenFloats(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(shortenFloats);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, shortenFloats(x)]),
    );
  }
  if (typeof v === "number" && !Number.isInteger(v) && v % 1 === 0) return Math.trunc(v);
  return v;
}

/** Recursive lexicographic key sort (array order preserved). */
function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    return Object.keys(v as object)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys((v as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return v;
}

type DiditEvent = {
  event_id: string;
  webhook_type?: string;
  session_id?: string;
  status: string;
  vendor_data?: string;
  decision?: unknown;
  resubmit_info?: { nodes_to_resubmit?: unknown };
};

export const Route = createFileRoute("/api/public/webhooks/didit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["DIDIT_WEBHOOK_SECRET"];
        if (!secret) return new Response("not configured", { status: 503 });

        const raw = await request.text();
        const sig = request.headers.get("x-signature-v2") ?? "";
        const ts = Number(request.headers.get("x-timestamp"));

        // 1. Freshness (replay protection)
        if (!ts || Math.abs(Date.now() / 1000 - ts) > 300) {
          return new Response("stale", { status: 401 });
        }

        // 2. Canonicalise
        let parsed: DiditEvent;
        try {
          parsed = JSON.parse(raw) as DiditEvent;
        } catch {
          return new Response("bad body", { status: 400 });
        }
        const canonical = JSON.stringify(sortKeys(shortenFloats(parsed)));

        // 3. Constant-time HMAC compare
        const expected = crypto
          .createHmac("sha256", secret)
          .update(canonical, "utf8")
          .digest("hex");
        if (
          sig.length !== expected.length ||
          !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
        ) {
          return new Response("bad sig", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // 4. Idempotency on event_id
        const { error: dupeError } = await supabaseAdmin
          .from("didit_webhook_events")
          .insert({
            event_id: parsed.event_id,
            session_id: parsed.session_id ?? null,
            webhook_type: parsed.webhook_type ?? null,
            status: parsed.status,
          });
        if (dupeError) return new Response("ok"); // already processed

        const userId = parsed.vendor_data ?? null;

        if (parsed.session_id) {
          await supabaseAdmin
            .from("didit_sessions")
            .update({
              status: parsed.status,
              decision: (parsed.decision ?? null) as never,
            })
            .eq("session_id", parsed.session_id);
        }

        // 5. Apply the decision (status strings are case-sensitive literals)
        if (userId) {
          const setProfile = async (status: "approved" | "rejected" | "pending", notes?: string) =>
            supabaseAdmin
              .from("profiles")
              .update({
                verification_status: status,
                reviewed_at: new Date().toISOString(),
                ...(notes ? { review_notes: notes } : {}),
              })
              .eq("id", userId);

          switch (parsed.status) {
            case "Approved":
              await setProfile("approved", "Identity verified automatically by Didit KYC.");
              break;
            case "Declined":
              await setProfile("rejected", "Identity verification was declined. Please contact support.");
              break;
            case "In Review":
              await setProfile("pending", "Identity verification is under manual review.");
              break;
            case "Resubmitted":
              await setProfile("pending", "Some verification steps must be resubmitted.");
              break;
            case "Kyc Expired":
              await setProfile("pending", "Your identity verification has expired — please verify again.");
              break;
            case "Not Started":
            case "In Progress":
            case "Awaiting User":
            case "Abandoned":
            case "Expired":
            default:
              // Informational — no profile change.
              break;
          }
        }

        // 6. 2xx fast
        return new Response("ok");
      },
    },
  },
});
