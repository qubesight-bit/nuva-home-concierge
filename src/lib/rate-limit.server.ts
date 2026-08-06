import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class RateLimitError extends Error {
  readonly retryAt: string | null;
  constructor(message: string, retryAt: string | null) {
    super(message);
    this.name = "RateLimitError";
    this.retryAt = retryAt;
  }
}

export type RateLimitRule = {
  /** Logical name of the protected action, e.g. "didit:session". */
  bucket: string;
  /** Who is being limited: user id, email, IP, or "global". */
  identity: string;
  /** Max allowed calls inside the window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
  /** Shown to the user when the rule trips. */
  message: string;
};

/** Best-effort caller IP, for limiting unauthenticated endpoints. */
export function getClientIdentity(): string {
  try {
    const ip =
      getRequestIP({ xForwardedFor: true }) ??
      getRequestHeader("cf-connecting-ip") ??
      null;
    return ip ? `ip:${ip}` : "ip:unknown";
  } catch {
    return "ip:unknown";
  }
}

async function consume(rule: RateLimitRule) {
  const { data, error } = await supabaseAdmin.rpc("consume_rate_limit", {
    _bucket: rule.bucket,
    _identity: rule.identity,
    _limit: rule.limit,
    _window_seconds: rule.windowSeconds,
  });

  if (error) {
    // Fail closed on expensive endpoints: if we cannot count, we do not spend money.
    console.error("[rate-limit] counter unavailable", rule.bucket, error.message);
    throw new RateLimitError(
      "We could not verify usage limits right now. Please try again in a moment.",
      null,
    );
  }

  return data as unknown as {
    allowed: boolean;
    count: number;
    limit: number;
    remaining: number;
    reset_at: string;
  };
}

/**
 * Enforces every rule in order. Throws RateLimitError on the first breach,
 * BEFORE any paid API call is made.
 */
export async function enforceRateLimits(rules: RateLimitRule[]) {
  for (const rule of rules) {
    const result = await consume(rule);
    if (!result.allowed) {
      console.warn(
        `[rate-limit] blocked ${rule.bucket} for ${rule.identity} (${result.count}/${rule.limit})`,
      );
      throw new RateLimitError(rule.message, result.reset_at ?? null);
    }
  }
}
