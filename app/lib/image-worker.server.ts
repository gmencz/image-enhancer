import invariant from "tiny-invariant";

const { IMAGE_WORKER_BASE_URL, IMAGE_WORKER_API_TOKEN } = process.env;
invariant(
  typeof IMAGE_WORKER_BASE_URL === "string",
  "IMAGE_WORKER_BASE_URL env var not set"
);
invariant(
  typeof IMAGE_WORKER_API_TOKEN === "string",
  "IMAGE_WORKER_API_TOKEN env var not set"
);

const AUTHORIZATION_HEADER = `Bearer ${IMAGE_WORKER_API_TOKEN}`;

export async function uploadImage(dataUrl: string) {
  const b64 = dataUrl.replace(/^data:image\/?[A-z]*;base64,/, "");
  const response = await fetch(`${IMAGE_WORKER_BASE_URL}/upload`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: AUTHORIZATION_HEADER,
    },
    body: JSON.stringify({
      body: b64,
    }),
  });

  const key = await response.text();
  return `${IMAGE_WORKER_BASE_URL}/${key}`;
}
