import { Hono } from "hono";
import { cache } from "hono/cache";
import { bearerAuth } from "hono/bearer-auth";
import { validator } from "hono/validator";
import { sha256 } from "hono/utils/crypto";
import { detectType } from "./utils";

const maxAge = 60 * 60 * 24 * 30;

const app = new Hono<{ Bindings: Bindings }>();

app.put("/upload", async (c, next) => {
  const auth = bearerAuth({ token: c.env.API_TOKEN });
  await auth(c, next);
});

app.put(
  "/upload",
  validator((v) => ({
    body: v.json("body").isRequired(),
  })),
  async (c) => {
    const res = c.req.valid();
    const base64 = res.body;

    const type = detectType(base64);
    if (!type) return c.notFound();

    const body = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const key = (await sha256(body)) + "." + type?.suffix;
    await c.env.BUCKET.put(key, body, {
      httpMetadata: { contentType: type.mimeType },
    });

    return c.text(key);
  }
);

app.get(
  "*",
  cache({
    cacheName: "imxgic-image-worker",
  })
);

app.get("/:key", async (c) => {
  const key = c.req.param("key");

  const object = await c.env.BUCKET.get(key);
  if (!object) return c.notFound();
  const data = await object.arrayBuffer();
  const contentType = object.httpMetadata?.contentType || "";

  return c.body(data, 200, {
    "Cache-Control": `public, max-age=${maxAge}`,
    "Content-Type": contentType,
  });
});

export default app;
