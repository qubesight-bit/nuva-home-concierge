import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Provider-side booking status transitions. Any other value is rejected.
 */
export const bookingUpdateSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["confirmed", "cancelled", "completed"]),
});

export function validateBookingUpdateInput(input: unknown) {
  return bookingUpdateSchema.parse(input);
}

export class ProviderNotVerifiedError extends Error {
  code = "PROVIDER_NOT_VERIFIED" as const;
  constructor(message = "Your identity verification must be approved before you can accept or update bookings.") {
    super(message);
    this.name = "ProviderNotVerifiedError";
  }
}

/**
 * Pure gate — asserts a provider is verified BEFORE any booking update runs.
 *
 * Splitting this out lets integration tests forge every kind of tampered
 * provider status (missing profile, "approved " with whitespace, uppercase,
 * "pending", "rejected", null, undefined, non-boolean id-verification rows)
 * and prove the server still rejects them.
 */
export function assertProviderVerified(input: {
  profileStatus: string | null | undefined;
  idVerificationStatus: string | null | undefined;
}): void {
  if (input.profileStatus !== "approved" || input.idVerificationStatus !== "approved") {
    throw new ProviderNotVerifiedError();
  }
}

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateBookingUpdateInput)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Fetch the caller's profile status (RLS-scoped to the caller).
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("verification_status")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);

    // 2. Fetch the caller's most recent id_verification row.
    const { data: idRow, error: idError } = await supabase
      .from("id_verifications")
      .select("status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (idError) throw new Error(idError.message);

    // 3. Gate — pure function, easy to test with forged inputs.
    assertProviderVerified({
      profileStatus: profile?.verification_status ?? null,
      idVerificationStatus: idRow?.status ?? null,
    });

    // 4. Confirm the caller owns the provider row this booking belongs to.
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, provider_id, providers:provider_id(user_id)")
      .eq("id", data.bookingId)
      .maybeSingle();
    if (bookingError) throw new Error(bookingError.message);
    if (!booking) throw new Error("Booking not found or not visible to you.");
    const ownerId = (booking.providers as { user_id: string } | null)?.user_id;
    if (ownerId !== userId) {
      throw new Error("You do not own the provider profile for this booking.");
    }

    // 5. Apply the update. RLS also enforces the verification requirement
    //    as defense-in-depth, so a compromised app layer cannot bypass it.
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.bookingId);
    if (updateError) throw new Error(updateError.message);

    return { ok: true, bookingId: data.bookingId, status: data.status };
  });
