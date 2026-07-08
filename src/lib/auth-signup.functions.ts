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

export const registerAccount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => signupSchema.parse(input))
  .handler(async ({ data }) => {
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
