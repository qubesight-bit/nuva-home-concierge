/**
 * SSRF guard for every outbound request the SERVER makes.
 *
 * Rules enforced here:
 *  - https only (no http, file:, gopher:, data:, ftp:, etc.)
 *  - host must be on an explicit per-call allowlist
 *  - literal IP hosts are rejected outright, and any private / loopback /
 *    link-local / cloud-metadata address is blocked (169.254.169.254 and
 *    friends, which is how a stranger would try to read our infra credentials)
 *  - no credentials in the URL, no redirects followed
 *
 * If a feature ever accepts a URL from a user and loads it server-side, it MUST
 * go through `safeFetch` with a narrow allowlist. Never call `fetch` directly
 * with a value that originated from a request body, query string, or database
 * row a user can write.
 */

export class SsrfBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SsrfBlockedError";
  }
}

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
]);

function isPrivateIPv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = nums as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127) return true; // this-network, private, loopback
  if (a === 169 && b === 254) return true; // link-local INCLUDING 169.254.169.254 metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a === 192 && b === 0) return true; // 192.0.0.0/24, 192.0.2.0/24
  if (a >= 224) return true; // multicast + reserved + broadcast
  return false;
}

function isIpLiteral(host: string): boolean {
  if (host.startsWith("[")) return true; // bracketed IPv6
  return /^[0-9.]+$/.test(host) || /^(0x|0b)/i.test(host) || /^\d+$/.test(host);
}

/** Validate a URL before the server is allowed to load it. Throws on danger. */
export function assertSafeUrl(rawUrl: string, allowedHosts: string[]): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SsrfBlockedError("That link is not a valid URL.");
  }

  if (url.protocol !== "https:") {
    throw new SsrfBlockedError("Only https links are allowed.");
  }
  if (url.username || url.password) {
    throw new SsrfBlockedError("Links with embedded credentials are not allowed.");
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, "");

  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith(".internal") || host.endsWith(".local")) {
    throw new SsrfBlockedError("That address is not reachable from this app.");
  }

  // Reject raw IPs entirely (decimal, hex, octal and IPv6 tricks included) and
  // double-block the private ranges for readability of intent.
  if (isIpLiteral(host)) {
    if (isPrivateIPv4(host)) {
      throw new SsrfBlockedError("That address is not reachable from this app.");
    }
    throw new SsrfBlockedError("Links must use a domain name, not an IP address.");
  }

  const allowed = allowedHosts.some(
    (candidate) => host === candidate.toLowerCase(),
  );
  if (!allowed) {
    throw new SsrfBlockedError("That destination is not on the allowed list.");
  }

  return url;
}

/** `fetch`, but only to vetted https destinations, and never following redirects. */
export async function safeFetch(
  rawUrl: string,
  allowedHosts: string[],
  init?: RequestInit,
): Promise<Response> {
  const url = assertSafeUrl(rawUrl, allowedHosts);
  return fetch(url.toString(), {
    ...init,
    // A 302 to 169.254.169.254 is the classic bypass — never auto-follow.
    redirect: "manual",
  });
}
