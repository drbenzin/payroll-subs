export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    // FormSubmit activated for www — keep every visitor on that origin.
    if (url.hostname === "payrollforsubs.com") {
      url.hostname = "www.payrollforsubs.com";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/e" && req.method === "POST") {
      const b = await req.json();
      await env.DB.prepare(
        "insert into events (ts, site, ev, sid, ref, ua) values (?, ?, ?, ?, ?, ?)"
      ).bind(
        Date.now(),
        env.SITE,
        String(b.ev).slice(0, 40),
        String(b.sid).slice(0, 40),
        String(b.ref || "").slice(0, 200),
        (req.headers.get("user-agent") || "").slice(0, 200)
      ).run();
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/checkout" && req.method === "POST") {
      return checkout(req, env, url.origin);
    }
    return env.ASSETS.fetch(req);
  },
};

// Stripe Checkout in setup mode: saves the card, charges nothing. Phase B of fake-door v2.
async function checkout(req, env, origin) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: "stripe_not_configured" }, 503);
  const b = await req.json();
  const email = String(b.email || "").slice(0, 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "bad_email" }, 400);

  const customer = await stripe(env, "customers", {
    email,
    "metadata[site]": env.SITE,
    "metadata[source]": "fake-door preorder",
  });
  const session = await stripe(env, "checkout/sessions", {
    mode: "setup",
    customer: customer.id,
    "payment_method_types[0]": "card",
    success_url: `${origin}/preorder-ok.html`,
    cancel_url: `${origin}/#pricing`,
    "custom_text[submit][message]":
      `Nothing is charged today. Your founding price of ${env.PRICE} is locked; the first charge happens on launch day, and we email you 48 hours before.`,
    "metadata[site]": env.SITE,
  });
  return json({ url: session.url });
}

async function stripe(env, path, params) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`stripe ${path}: ${data.error?.message || r.status}`);
  return data;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
