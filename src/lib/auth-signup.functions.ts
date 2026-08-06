import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(1).max(100),
  ageConfirmed: z.literal(true, {
    errorMap: () => ({ message: "You must confirm you are at least 18 years old." }),
  }),
});

/**
 * Server-side validator for signup input. Exported so tests can attempt to
 * bypass the UI by calling it directly with forged payloads and verify that
 * the server-side gate still rejects them before any account is created.
 */
export function validateSignupInput(input: unknown) {
  return signupSchema.parse(input);
}

export const registerAccount = createServerFn({ method: "POST" })
  .inputValidator(validateSignupInput)
  .handler(async ({ data }) => {
    // Signup is unauthenticated and each new account can trigger a paid
    // identity-verification session, so account creation itself is the
    // spend surface: throttle by caller IP per hour AND per day, and cap
    // total sign-ups per hour and per day.
    const { enforceRateLimits, getClientIdentity } = await import(
      "@/lib/rate-limit.server"
    );
    const ip = getClientIdentity();
    await enforceRateLimits([
      {
        bucket: "signup:ip:hour",
        identity: ip,
        limit: 5,
        windowSeconds: 3600,
        message: "Too many sign-up attempts. Please try again in an hour.",
      },
      {
        // Without this, 5/hour still means 120 free accounts a day per IP.
        bucket: "signup:ip:day",
        identity: ip,
        limit: 10,
        windowSeconds: 86400,
        message: "Too many sign-up attempts from this connection today. Please try again tomorrow.",
      },
      {
        bucket: "signup:global:hour",
        identity: "global",
        limit: 60,
        windowSeconds: 3600,
        message: "Sign-ups are busy right now. Please try again in a little while.",
      },
      {
        bucket: "signup:global:day",
        identity: "global",
        limit: 500,
        windowSeconds: 86400,
        message: "Sign-ups are temporarily paused. Please try again later.",
      },
    ]);


    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");


    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        display_name: data.displayName,
        age_confirmed: true,
        age_confirmed_at: new Date().toISOString(),
      },
    });

    if (error || !created.user) {
      throw new Error(error?.message ?? "Sign up failed.");
    }

    return { userId: created.user.id };
  });
