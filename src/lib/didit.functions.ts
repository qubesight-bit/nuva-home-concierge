import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Per-session config — NOT a secret, NOT an env var.
 * "KYC + AML" workflow from the Didit console.
 */
export const DIDIT_WORKFLOW_ID = "72eaefd2-8638-40bf-98c9-3100d5dc313a";

/**
 * Creates a Didit verification session for the signed-in user.
 * The API key never leaves the server; only { url, session_id } is returned.
 */
export const createDiditSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const apiKey = process.env["DIDIT_API_KEY"];
    if (!apiKey) throw new Error("Identity verification is not configured yet.");

    // Each Didit session costs credits. Per-user limits alone are defeated by
    // registering fresh accounts, so we also throttle by caller IP and cap
    // total spend per hour and per day before the paid API is ever called.
    const { enforceRateLimits, getClientIdentity } = await import(
      "@/lib/rate-limit.server"
    );
    const ip = getClientIdentity();
    await enforceRateLimits([
      {
        bucket: "didit:session:user:hour",
        identity: context.userId,
        limit: 3,
        windowSeconds: 3600,
        message:
          "You have started identity verification several times already. Please finish the open session or try again in an hour.",
      },
      {
        bucket: "didit:session:user:day",
        identity: context.userId,
        limit: 8,
        windowSeconds: 86400,
        message:
          "Daily identity verification limit reached for this account. Please try again tomorrow or contact support.",
      },
      {
        // Blocks the "make a new account per session" money pump.
        bucket: "didit:session:ip:hour",
        identity: ip,
        limit: 5,
        windowSeconds: 3600,
        message:
          "Too many identity verification attempts from this connection. Please try again in an hour.",
      },
      {
        bucket: "didit:session:ip:day",
        identity: ip,
        limit: 12,
        windowSeconds: 86400,
        message:
          "Too many identity verification attempts from this connection today. Please try again tomorrow or contact support.",
      },
      {
        // Burst cap: a distributed script cannot drain the day's budget in minutes.
        bucket: "didit:session:global:hour",
        identity: "global",
        limit: 40,
        windowSeconds: 3600,
        message:
          "Identity verification is busy right now. Please try again in a little while.",
      },
      {
        bucket: "didit:session:global:day",
        identity: "global",
        limit: 300,
        windowSeconds: 86400,
        message:
          "Identity verification is temporarily paused due to unusually high volume. Please try again later.",
      },
    ]);




    const origin = process.env["PUBLIC_SITE_URL"] ?? "https://nuva.lovable.app";

    const res = await fetch("https://verification.didit.me/v3/session/", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow_id: DIDIT_WORKFLOW_ID,
        vendor_data: context.userId,
        callback: `${origin}/dashboard`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Didit session create failed", res.status, detail);
      let reason = "";
      try {
        const parsed = JSON.parse(detail) as { detail?: string; message?: string };
        reason = parsed.detail ?? parsed.message ?? "";
      } catch {
        /* non-JSON body */
      }
      if (/credit/i.test(reason)) {
        throw new Error(
          "Identity verification is temporarily unavailable (verification provider account is out of credits). Please try again later.",
        );
      }
      throw new Error(
        reason
          ? `Could not start identity verification: ${reason}`
          : "Could not start identity verification. Please try again.",
      );
    }

    const session = (await res.json()) as {
      session_id: string;
      url: string;
      status?: string;
    };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("didit_sessions").upsert(
      {
        user_id: context.userId,
        session_id: session.session_id,
        workflow_id: DIDIT_WORKFLOW_ID,
        status: session.status ?? "Not Started",
      },
      { onConflict: "session_id" },
    );

    return { url: session.url, session_id: session.session_id };
  });

/** Latest Didit session status for the signed-in user (UI hint only). */
export const getMyDiditStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("didit_sessions")
      .select("session_id, status, updated_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ?? null;
  });
