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
    return env.ASSETS.fetch(req);
  },
};
