import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  computeBookingPrice,
  MAX_DURATION_HOURS,
  MIN_DURATION_HOURS,
  type CustomExtra,
} from "@/lib/booking-pricing";

/**
 * Booking creation input. Note what is NOT here: any price, total or amount.
 * The client picks options; the server prices them.
 */
export const bookingCreateSchema = z.object({
  providerId: z.string().uuid(),
  serviceId: z.string().trim().min(1).max(40),
  bookingDate: z.string().trim().min(1).max(40),
  bookingTime: z.string().trim().min(1).max(20),
  durationHours: z.number().int().min(MIN_DURATION_HOURS).max(MAX_DURATION_HOURS),
  extras: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  notes: z.string().trim().max(1000).optional(),
});

export function validateBookingCreateInput(input: unknown) {
  return bookingCreateSchema.parse(input);
}

/**
 * Creates a booking with a server-computed total.
 *
 * The provider's hourly rate and custom extra prices are read from the
 * database; service surcharges and standard extras come from the server-side
 * price table. A tampered client cannot influence the charged amount, and the
 * database additionally blocks direct inserts and later price edits.
 */
export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validateBookingCreateInput)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Provider must be real, active, published and verified — checked server-side.
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("id, user_id, rate_per_hour, is_active, is_published, custom_extras")
      .eq("id", data.providerId)
      .maybeSingle();
    if (providerError) throw new Error(providerError.message);
    if (!provider || !provider.is_active || !provider.is_published) {
      throw new Error("This provider is not available for booking.");
    }
    if (provider.user_id === userId) {
      throw new Error("You cannot book your own listing.");
    }

    const price = computeBookingPrice({
      providerRatePerHour: Number(provider.rate_per_hour),
      serviceId: data.serviceId,
      durationHours: data.durationHours,
      extraIds: data.extras,
      customExtras: (provider.custom_extras as CustomExtra[] | null) ?? [],
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("bookings")
      .insert({
        client_user_id: userId,
        provider_id: provider.id,
        service: price.serviceName,
        booking_date: data.bookingDate,
        booking_time: data.bookingTime,
        duration_hours: data.durationHours,
        extras: data.extras,
        total_cents: price.totalCents,
        notes: data.notes ?? null,
      })
      .select("id, total_cents")
      .single();
    if (insertError) throw new Error(insertError.message);

    return { ok: true, bookingId: inserted.id, totalCents: inserted.total_cents };
  });


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
