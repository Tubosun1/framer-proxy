export default async function handler(req, res) {
  try {
    const path = req.url.replace(/^\/api\/proxy/, "") || "/";
    const target = `https://tecnoverse.framer.website${path}`;

    const framerRes = await fetch(target, {
      headers: { "User-Agent": req.headers["user-agent"] || "Vercel-Proxy" }
    });

    const contentType = framerRes.headers.get("content-type") || "";

    if (contentType.includes("text/html")) {
      let body = await framerRes.text();

      // Remove only the "Made with Framer" badge link
      body = body.replace(/<a[^>]*href=["']https:\/\/framer\.com[^>]*>.*?<\/a>/gi, "");

      // Remove the plain text version too, just in case
      body = body.replace(/Made with Framer/gi, "");

      res.setHeader("content-type", contentType);
      res.status(framerRes.status).send(body);
      return;
    }

    const arrayBuffer = await framerRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ct = framerRes.headers.get("content-type");
    if (ct) res.setHeader("content-type", ct);
    res.status(framerRes.status).send(buffer);
  } catch (err) {
    res.status(500).send("Proxy error: " + String(err));
  }
}
