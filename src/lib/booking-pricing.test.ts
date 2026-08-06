import { describe, expect, it } from "vitest";
import { computeBookingPrice } from "./booking-pricing";
import { validateBookingCreateInput } from "./bookings.functions";

const base = {
  providerRatePerHour: 150,
  serviceId: "standard",
  durationHours: 3,
  extraIds: [] as string[],
};

describe("server-side booking pricing", () => {
  it("prices from the provider rate, not the client", () => {
    expect(computeBookingPrice(base).totalCents).toBe(45000);
  });

  it("adds service surcharge and known extras", () => {
    const r = computeBookingPrice({ ...base, serviceId: "deep", extraIds: ["laundry", "oven"] });
    expect(r.total).toBe((150 + 12) * 3 + 35 + 30);
  });

  it("ignores duplicate extras", () => {
    const r = computeBookingPrice({ ...base, extraIds: ["laundry", "laundry"] });
    expect(r.extrasTotal).toBe(35);
  });

  it("rejects unknown extras and services", () => {
    expect(() => computeBookingPrice({ ...base, extraIds: ["free_stuff"] })).toThrow();
    expect(() => computeBookingPrice({ ...base, serviceId: "hacked" })).toThrow();
  });

  it("uses provider custom extra prices from the database", () => {
    const r = computeBookingPrice({
      ...base,
      extraIds: ["balcony"],
      customExtras: [{ id: "balcony", name: "Balcony", price: 20 }],
    });
    expect(r.extrasTotal).toBe(20);
  });

  it("rejects out-of-range durations", () => {
    expect(() => computeBookingPrice({ ...base, durationHours: 0 })).toThrow();
    expect(() => computeBookingPrice({ ...base, durationHours: 999 })).toThrow();
    expect(() => computeBookingPrice({ ...base, durationHours: -3 })).toThrow();
  });
});

describe("forged booking payloads", () => {
  const good = {
    providerId: "11111111-1111-4111-8111-111111111111",
    serviceId: "standard",
    bookingDate: "2026-09-01",
    bookingTime: "10:00",
    durationHours: 3,
    extras: [],
  };

  it("strips any client-supplied amount", () => {
    const parsed = validateBookingCreateInput({ ...good, total_cents: 1, amount: 1, price: 1 });
    expect(parsed).not.toHaveProperty("total_cents");
    expect(parsed).not.toHaveProperty("amount");
    expect(parsed).not.toHaveProperty("price");
  });

  it("rejects tampered durations and non-uuid providers", () => {
    expect(() => validateBookingCreateInput({ ...good, durationHours: 0 })).toThrow();
    expect(() => validateBookingCreateInput({ ...good, durationHours: 1.5 })).toThrow();
    expect(() => validateBookingCreateInput({ ...good, providerId: "not-a-uuid" })).toThrow();
  });
});
