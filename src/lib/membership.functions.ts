import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertSafeUrl, safeFetch } from "@/lib/safe-fetch";

export const membershipPaymentSchema = z.object({
  email: z.string().trim().email().max(255),
});

export function validateMembershipPaymentInput(input: unknown) {
  return membershipPaymentSchema.parse(input);
}

/**
 * Sends the customer a PayPal payment link for Nuva Plus ($19/mo).
 *
 * Requires server env:
 * - PAYPAL_MEMBERSHIP_LINK — full PayPal checkout / payment URL
 * - RESEND_API_KEY — Resend API key for outbound email
 * - MEMBERSHIP_FROM_EMAIL (optional) — verified sender, e.g. "Nuva <billing@yourdomain.com>"
 */
export const sendMembershipPaymentLink = createServerFn({ method: "POST" })
  .inputValidator(validateMembershipPaymentInput)
  .handler(async ({ data }) => {
    // Unauthenticated + costs money per send: limit per recipient, per caller IP
    // (hour and day), and cap total sends per hour and per day before touching
    // the email provider.
    const { enforceRateLimits, getClientIdentity } = await import(
      "@/lib/rate-limit.server"
    );
    const ip = getClientIdentity();
    await enforceRateLimits([
      {
        bucket: "membership:email:recipient:hour",
        identity: data.email.toLowerCase(),
        limit: 3,
        windowSeconds: 3600,
        message:
          "We already sent payment links to this address. Please check your inbox, or try again in an hour.",
      },
      {
        bucket: "membership:email:ip:hour",
        identity: ip,
        limit: 8,
        windowSeconds: 3600,
        message: "Too many requests. Please wait a little while and try again.",
      },
      {
        // A rotating list of recipient addresses from one IP is the real abuse path.
        bucket: "membership:email:ip:day",
        identity: ip,
        limit: 20,
        windowSeconds: 86400,
        message: "Too many requests from this connection today. Please try again tomorrow.",
      },
      {
        bucket: "membership:email:global:hour",
        identity: "global",
        limit: 60,
        windowSeconds: 3600,
        message:
          "Membership emails are busy right now. Please try again in a little while.",
      },
      {
        bucket: "membership:email:global:day",
        identity: "global",
        limit: 500,
        windowSeconds: 86400,
        message:
          "Membership emails are temporarily paused due to unusually high volume. Please try again later.",
      },
    ]);


    const paypalLink = process.env.PAYPAL_MEMBERSHIP_LINK?.trim();
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const from =
      process.env.MEMBERSHIP_FROM_EMAIL?.trim() || "Nuva <onboarding@resend.dev>";

    if (!paypalLink) {
      throw new Error(
        "Membership payments are not configured yet. Missing PAYPAL_MEMBERSHIP_LINK.",
      );
    }
    if (!resendKey) {
      throw new Error(
        "Membership emails are not configured yet. Missing RESEND_API_KEY.",
      );
    }


    // The PayPal link comes from server env, but we still verify it points at
    // PayPal before emailing it out — a bad env value must never become a link.
    assertSafeUrl(paypalLink, ["www.paypal.com", "paypal.com", "www.paypal.me", "paypal.me"]);

    const response = await safeFetch("https://api.resend.com/emails", ["api.resend.com"], {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [data.email],
        subject: "Complete your Nuva Plus payment",
        html: `
          <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
            <h1 style="font-size: 22px; margin-bottom: 12px;">Nuva Plus</h1>
            <p style="line-height: 1.5; margin-bottom: 16px;">
              Thanks for choosing Nuva Plus. Use the secure PayPal link below to process your
              $19/month membership payment.
            </p>
            <p style="margin: 28px 0;">
              <a href="${paypalLink}"
                 style="display: inline-block; background: #111; color: #fff; text-decoration: none;
                        padding: 12px 22px; border-radius: 999px; font-weight: 600;">
                Pay with PayPal
              </a>
            </p>
            <p style="font-size: 13px; color: #666; line-height: 1.5;">
              If the button does not work, copy and paste this link into your browser:<br/>
              <a href="${paypalLink}" style="color: #666;">${paypalLink}</a>
            </p>
          </div>
        `,
        text: `Thanks for choosing Nuva Plus. Complete your $19/month payment here: ${paypalLink}`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[membership] Resend failed", response.status, detail);
      throw new Error("We could not send the payment email. Please try again shortly.");
    }

    return { ok: true as const };
  });
