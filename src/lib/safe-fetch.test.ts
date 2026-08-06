import { describe, expect, it } from "vitest";
import { assertSafeUrl, SsrfBlockedError } from "./safe-fetch";

const ALLOW = ["api.resend.com", "verification.didit.me"];

describe("assertSafeUrl", () => {
  it("allows an exact allowlisted https host", () => {
    expect(assertSafeUrl("https://api.resend.com/emails", ALLOW).hostname).toBe(
      "api.resend.com",
    );
  });

  const blocked = [
    "http://api.resend.com/emails", // plain http
    "https://169.254.169.254/latest/meta-data/", // AWS metadata
    "https://metadata.google.internal/computeMetadata/v1/", // GCP metadata
    "https://127.0.0.1/admin",
    "https://localhost:8080/",
    "https://10.0.0.5/",
    "https://192.168.1.1/",
    "https://172.16.0.9/",
    "https://[::1]/",
    "https://2852039166/", // decimal-encoded 169.254.169.254
    "https://0x7f000001/", // hex-encoded loopback
    "https://evil.com/steal",
    "https://api.resend.com.evil.com/",
    "https://user:pass@api.resend.com/",
    "file:///etc/passwd",
    "gopher://api.resend.com/",
    "not a url",
  ];

  for (const url of blocked) {
    it(`blocks ${url}`, () => {
      expect(() => assertSafeUrl(url, ALLOW)).toThrow(SsrfBlockedError);
    });
  }
});
