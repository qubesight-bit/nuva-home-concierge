import { describe, it, expect } from "vitest";
import {
  assertProviderVerified,
  bookingUpdateSchema,
  ProviderNotVerifiedError,
  validateBookingUpdateInput,
} from "./bookings.functions";

/**
 * These tests simulate an attacker calling the updateBookingStatus server
 * function directly (curl/fetch/custom client) with a forged payload OR a
 * tampered client that lies about the provider being "approved". The two
 * server-side gates that must reject them are:
 *   - validateBookingUpdateInput  (Zod input validator)
 *   - assertProviderVerified      (pure verification gate the handler runs
 *                                  BEFORE the update SQL is issued)
 * RLS is the third layer and is exercised end-to-end by the E2E suite.
 */

const validBookingId = "11111111-1111-1111-1111-111111111111";

describe("updateBookingStatus input validator (forged payload attempts)", () => {
  const forged: Array<[string, unknown]> = [
    ["empty object", {}],
    ["null", null],
    ["array", []],
    ["missing status", { bookingId: validBookingId }],
    ["missing bookingId", { status: "confirmed" }],
    ["bookingId not a uuid", { bookingId: "not-a-uuid", status: "confirmed" }],
    ["bookingId is a number", { bookingId: 42, status: "confirmed" }],
    ["status not in enum ('accepted')", { bookingId: validBookingId, status: "accepted" }],
    ["status not in enum ('approved')", { bookingId: validBookingId, status: "approved" }],
    ["status is boolean true", { bookingId: validBookingId, status: true }],
    ["status is uppercase", { bookingId: validBookingId, status: "CONFIRMED" }],
    ["SQL-ish payload", { bookingId: validBookingId, status: "confirmed'; drop table bookings;--" }],
    ["injected extra provider_status=approved", {
      bookingId: validBookingId,
      status: "confirmed",
      provider_status: "approved",
      verification_status: "approved",
      is_admin: true,
    }],
  ];

  // The last case has extra keys — Zod strips them by default. We assert the
  // parsed value does not carry them (so the handler cannot be tricked into
  // trusting a client-supplied "verified" flag).
  it("strips attacker-supplied extra fields on the happy path", () => {
    const parsed = validateBookingUpdateInput({
      bookingId: validBookingId,
      status: "confirmed",
      provider_status: "approved",
      verification_status: "approved",
      is_admin: true,
    });
    expect(parsed).toEqual({ bookingId: validBookingId, status: "confirmed" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((parsed as any).provider_status).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((parsed as any).is_admin).toBeUndefined();
  });

  for (const [name, payload] of forged.slice(0, -1)) {
    it(`rejects: ${name}`, () => {
      expect(() => validateBookingUpdateInput(payload)).toThrow();
    });
  }

  it("accepts only the three whitelisted statuses", () => {
    for (const status of ["confirmed", "cancelled", "completed"] as const) {
      expect(() =>
        validateBookingUpdateInput({ bookingId: validBookingId, status }),
      ).not.toThrow();
    }
  });

  it("exposes a strict schema (no passthrough)", () => {
    // Guard against a future refactor loosening the schema.
    expect(bookingUpdateSchema.safeParse({}).success).toBe(false);
  });
});

describe("assertProviderVerified (forged provider status attempts)", () => {
  // Only { profileStatus: 'approved', idVerificationStatus: 'approved' } passes.
  const forgedProviderStates: Array<[string, { profileStatus: unknown; idVerificationStatus: unknown }]> = [
    ["both missing", { profileStatus: null, idVerificationStatus: null }],
    ["profile missing, id approved", { profileStatus: null, idVerificationStatus: "approved" }],
    ["profile approved, id missing", { profileStatus: "approved", idVerificationStatus: null }],
    ["both pending", { profileStatus: "pending", idVerificationStatus: "pending" }],
    ["profile pending, id approved", { profileStatus: "pending", idVerificationStatus: "approved" }],
    ["profile approved, id pending", { profileStatus: "approved", idVerificationStatus: "pending" }],
    ["profile rejected, id approved", { profileStatus: "rejected", idVerificationStatus: "approved" }],
    ["profile approved, id rejected", { profileStatus: "approved", idVerificationStatus: "rejected" }],
    ["uppercase APPROVED", { profileStatus: "APPROVED", idVerificationStatus: "APPROVED" }],
    ["approved with trailing whitespace", { profileStatus: "approved ", idVerificationStatus: "approved " }],
    ["boolean true", { profileStatus: true, idVerificationStatus: true }],
    ["number 1", { profileStatus: 1, idVerificationStatus: 1 }],
    ["undefined", { profileStatus: undefined, idVerificationStatus: undefined }],
    ["injected string 'approved,admin'", { profileStatus: "approved,admin", idVerificationStatus: "approved,admin" }],
  ];

  for (const [name, state] of forgedProviderStates) {
    it(`rejects forged provider state: ${name}`, () => {
      expect(() =>
        assertProviderVerified(state as { profileStatus: string | null; idVerificationStatus: string | null }),
      ).toThrow(ProviderNotVerifiedError);
    });
  }

  it("accepts only exact match ('approved' + 'approved')", () => {
    expect(() =>
      assertProviderVerified({ profileStatus: "approved", idVerificationStatus: "approved" }),
    ).not.toThrow();
  });

  it("throws with a clear, user-facing message", () => {
    try {
      assertProviderVerified({ profileStatus: "pending", idVerificationStatus: "approved" });
      throw new Error("gate did not throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ProviderNotVerifiedError);
      expect((e as Error).message).toMatch(/verification.*approved/i);
      expect((e as ProviderNotVerifiedError).code).toBe("PROVIDER_NOT_VERIFIED");
    }
  });
});
