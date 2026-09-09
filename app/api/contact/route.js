import { contact } from "@/lib/data";

/**
 * Contact form endpoint.
 *
 * Delivery goes through Resend's HTTP API, called with plain `fetch` so the
 * project does not gain a dependency for one request. The key is read from the
 * server environment and never reaches the client.
 *
 * Required environment variables:
 *   RESEND_API_KEY     - from https://resend.com/api-keys
 *   CONTACT_FROM_EMAIL - a verified sender on your Resend domain,
 *                        e.g. "Portfolio <hello@yourdomain.com>"
 *   CONTACT_TO_EMAIL   - optional; defaults to the address in lib/data.js
 *
 * Until RESEND_API_KEY and CONTACT_FROM_EMAIL are set this returns 503 with
 * `configured: false`, and the form tells the visitor to email directly
 * instead. It never reports a message as sent when nothing was sent.
 */

export const runtime = "nodejs";

const MAX = { name: 100, email: 200, message: 4000 };
// Deliberately loose: the real check is whether the reply bounces, and a
// strict pattern rejects valid addresses far more often than it catches typos.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Malformed request." }, 400);
  }

  const name = String(payload?.name ?? "").trim();
  const email = String(payload?.email ?? "").trim();
  const message = String(payload?.message ?? "").trim();

  // Server-side validation, mirroring the client. The client check is for
  // feedback speed; this one is the check that actually matters.
  const errors = {};
  if (!name) errors.name = "Please enter your name.";
  else if (name.length > MAX.name) errors.name = "That name is too long.";

  if (!email) errors.email = "Please enter your email.";
  else if (!EMAIL_RE.test(email)) errors.email = "That email address looks incomplete.";
  else if (email.length > MAX.email) errors.email = "That email is too long.";

  if (!message) errors.message = "Please enter a message.";
  else if (message.length > MAX.message) errors.message = "That message is too long.";

  if (Object.keys(errors).length > 0) {
    return json({ ok: false, errors }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || contact.email;

  if (!apiKey || !from) {
    return json(
      {
        ok: false,
        configured: false,
        error: "Email delivery is not configured on this deployment yet.",
      },
      503
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });

    if (!response.ok) {
      // Log the provider's reason server-side; never leak it to the client.
      console.error("Resend rejected the message:", response.status, await response.text());
      return json({ ok: false, error: "Could not send the message." }, 502);
    }
  } catch (error) {
    console.error("Contact form delivery failed:", error);
    return json({ ok: false, error: "Could not reach the mail service." }, 502);
  }

  return json({ ok: true }, 200);
}
