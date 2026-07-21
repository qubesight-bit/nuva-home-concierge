import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

    const response = await fetch("https://api.resend.com/emails", {
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
