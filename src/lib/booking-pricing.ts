/**
 * Authoritative booking price table.
 *
 * The browser never decides what a booking costs — it only sends the *choices*
 * (service id, duration, extra ids). The server looks the prices up here and in
 * the provider row, then recomputes the total. Anything the client sends as an
 * amount is ignored.
 */

export const SERVICE_SURCHARGE_PER_HOUR: Record<string, { name: string; perHour: number }> = {
  standard: { name: "Signature Clean", perHour: 0 },
  deep: { name: "Deep Clean", perHour: 12 },
  move: { name: "Move-In / Move-Out", perHour: 15 },
  eco: { name: "Eco Luxe Clean", perHour: 8 },
};

export const EXTRA_PRICES: Record<string, { name: string; price: number }> = {
  laundry: { name: "Laundry & Ironing", price: 35 },
  fridge: { name: "Inside Fridge", price: 25 },
  oven: { name: "Inside Oven", price: 30 },
  windows: { name: "Interior Windows", price: 40 },
  organization: { name: "Wardrobe Organization", price: 45 },
};

export const MIN_DURATION_HOURS = 1;
export const MAX_DURATION_HOURS = 12;

export interface CustomExtra {
  id?: string;
  name?: string;
  price?: number;
}

export interface PriceInput {
  /** Provider's hourly rate, read from the database — never from the client. */
  providerRatePerHour: number;
  serviceId: string;
  durationHours: number;
  extraIds: string[];
  /** Provider-defined extras stored on the provider row (JSONB). */
  customExtras?: CustomExtra[];
}

export interface PriceResult {
  serviceName: string;
  hourlyRate: number;
  extrasTotal: number;
  total: number;
  totalCents: number;
}

export function computeBookingPrice(input: PriceInput): PriceResult {
  const service = SERVICE_SURCHARGE_PER_HOUR[input.serviceId];
  if (!service) throw new Error("Unknown service selected.");

  const duration = Math.trunc(input.durationHours);
  if (
    !Number.isFinite(duration) ||
    duration < MIN_DURATION_HOURS ||
    duration > MAX_DURATION_HOURS
  ) {
    throw new Error("Invalid booking duration.");
  }

  const rate = Number(input.providerRatePerHour);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("Provider rate unavailable.");

  const customMap = new Map<string, number>();
  for (const e of input.customExtras ?? []) {
    const id = String(e?.id ?? e?.name ?? "").trim();
    const price = Number(e?.price);
    if (id && Number.isFinite(price) && price >= 0) customMap.set(id, price);
  }

  let extrasTotal = 0;
  for (const id of new Set(input.extraIds)) {
    const known = EXTRA_PRICES[id];
    if (known) {
      extrasTotal += known.price;
      continue;
    }
    const custom = customMap.get(id);
    if (custom === undefined) throw new Error(`Unknown extra selected: ${id}`);
    extrasTotal += custom;
  }

  const hourlyRate = rate + service.perHour;
  const total = hourlyRate * duration + extrasTotal;

  return {
    serviceName: service.name,
    hourlyRate,
    extrasTotal,
    total,
    totalCents: Math.round(total * 100),
  };
}
