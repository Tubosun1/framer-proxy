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

      // Remove any static "Made with Framer" text/link
      body = body.replace(/Made with Framer/gi, "");
      body = body.replace(/<a[^>]*href=["']https:\/\/framer\.com[^>]*>.*?<\/a>/gi, "");

      // Inject script to remove/hide dynamic Framer badge
      const removerScript = `
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            // Look for any links or elements containing "Framer"
            const framerBadge = document.querySelectorAll('a[href*="framer.com"], [class*="framer"]');
            framerBadge.forEach(el => el.style.display = "none");
          });
        </script>
      `;

      // Inject our script before </body>
      body = body.replace("</body>", `${removerScript}</body>`);

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
