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

      // 1. Remove "Made with Framer" text
      body = body.replace(/Made with Framer/gi, "");

      // 2. Remove the Framer badge (entire <a> element linking to framer.com)
      body = body.replace(/<a[^>]*href="https:\/\/framer\.com[^>]*>.*?<\/a>/gi, "");

      // 3. Remove Framer favicon <link> tags
      body = body.replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, "");
      body = body.replace(/<link[^>]*rel=["']shortcut icon["'][^>]*>/gi, "");

      // 4. Optionally inject your own favicon
      const customFavicon = `<link rel="icon" href="/favicon.ico" type="image/x-icon">`;
      body = body.replace("</head>", `${customFavicon}</head>`);

      res.setHeader("content-type", contentType);
      res.status(framerRes.status).send(body);
      return;
    }

    const arrayBuffer = await framerRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ct = framerRes.headers.get("co
