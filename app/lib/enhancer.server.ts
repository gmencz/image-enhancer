import invariant from "tiny-invariant";
import type { UploadedImage } from "~/hooks/use-enhancer-dropzone";

const { REPLICATE_API_TOKEN } = process.env;
invariant(
  typeof REPLICATE_API_TOKEN === "string",
  "REPLICATE_API_TOKEN env var not set"
);

const AUTHORIZATION_HEADER = `Token ${REPLICATE_API_TOKEN}`;

enum ReplicateVersion {
  // https://replicate.com/google-research/maxim
  maxim = "494ca4d578293b4b93945115601b6a38190519da18467556ca223d219c3af9f9",

  // https://replicate.com/cjwbw/bigcolor
  bigcolor = "9451bfbf652b21a9bccc741e5c7046540faa5586cfa3aa45abc7dbb46151a4f7",

  // https://replicate.com/tencentarc/gfpgan
  gfpgan = "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",

  // https://replicate.com/jingyunliang/swinir
  swinir = "660d922d33153019e8c263a3bba265de882e7f4f70396546b6c9c8f9d47a021a",
}

export enum Effect {
  Upscale = "Upscale",
  Deblur = "Deblur",
  Denoise = "Denoise",
  DerainRainStreak = "Derain (Rain streaks)",
  DerainRainDrop = "Derain (Rain drops)",
  DehazeOutdoor = "Dehaze (Outdoors)",
  DehazeIndoor = "Dehaze (Indoors)",
  Lighten = "Lighten",
  Retouch = "Retouch",
  WatermarkRemoval = "Watermark removal",
  Colorize = "Colorize",
  FaceRestoration = "Face restoration",
}

interface MaximInput {
  image: string;
  model: string;
}

interface BigcolorInput {
  image: string;
  mode: string;
  classes: string;
}

interface GfpganInput {
  img: string;
  version: string;
  scale: number;
}

interface SwinirInput {
  image: string;
  task_type: string;
  noise: number;
  jpeg: number;
}

interface BigcolorOutput {
  image: string;
}

interface ReplicatePredictionBody {
  version: ReplicateVersion;
  input: MaximInput | BigcolorInput | GfpganInput | SwinirInput;
}

/**
 * Gets the replicate version to use based on the desired effect to apply.
 * @param effect The effect the models from the replicate version should apply.
 * @returns The replicate version to use to apply the effect.
 */
function getReplicateVersion(effect: Effect) {
  let replicateVersion: ReplicateVersion | null = null;
  switch (effect) {
    case Effect.Deblur:
    case Effect.Denoise:
    case Effect.DerainRainDrop:
    case Effect.DerainRainStreak:
    case Effect.DehazeIndoor:
    case Effect.DehazeOutdoor:
    case Effect.Lighten:
    case Effect.Retouch:
      replicateVersion = ReplicateVersion.maxim;
      break;
    case Effect.Colorize:
      replicateVersion = ReplicateVersion.bigcolor;
      break;
    case Effect.FaceRestoration:
      replicateVersion = ReplicateVersion.gfpgan;
      break;
    case Effect.Upscale:
      replicateVersion = ReplicateVersion.swinir;
      break;
  }

  if (!replicateVersion) {
    throw new Error(
      `getReplicateVersion: No replicate version found for effect ${effect}`
    );
  }

  return replicateVersion;
}

/**
 * Gets the models that apply this effect, it can be multiple models that process the effect differently
 * (like for deblurring) but we need to run them all so the user can choose the output they prefer.
 * @param effect The effect the models should apply.
 * @returns The models that apply this effect.
 */
function getMaximModels(effect: Effect) {
  const models: string[] = [];
  switch (effect) {
    case Effect.Denoise:
      models.push("Image Denoising");
      break;
    case Effect.Deblur:
      models.push(
        "Image Deblurring (GoPro)",
        "Image Deblurring (REDS)",
        "Image Deblurring (RealBlur_R)",
        "Image Deblurring (RealBlur_J)"
      );
      break;
    case Effect.DerainRainStreak:
      models.push("Image Deraining (Rain streak)");
      break;
    case Effect.DerainRainDrop:
      models.push("Image Deraining (Rain drop)");
      break;
    case Effect.DehazeIndoor:
      models.push("Image Dehazing (Indoor)");
      break;
    case Effect.DehazeOutdoor:
      models.push("Image Dehazing (Outdoor)");
      break;
    case Effect.Lighten:
      models.push("Image Enhancement (Low-light)");
      break;
    case Effect.Retouch:
      models.push("Image Enhancement (Retouching)");
      break;
  }

  if (!models.length) {
    throw new Error(`getMaximModel: No models found for effect ${effect}`);
  }

  return models;
}

/**
 * Creates a replicate prediction (https://replicate.com/docs/reference/http#create-prediction) and returns
 * the result when it's ready or throws if the prediction fails or is canceled.
 * @param body
 * @param pollingInterval
 * @returns
 */
async function runReplicatePrediction(
  body: ReplicatePredictionBody,
  pollingInterval: number = 5000
) {
  const startResponse = await fetch(
    "https://api.replicate.com/v1/predictions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTHORIZATION_HEADER,
      },
      body: JSON.stringify(body),
    }
  );

  const jsonStartResponse = await startResponse.json();
  const endpointUrl = jsonStartResponse.urls.get;

  // GET request to get the status of the image enhancement process & return the result when it's ready
  const enhancedImages: string[] = [];
  let errorMessage: string | null = null;
  while (!enhancedImages.length) {
    // Loop in `pollingInterval` intervals until the image is ready
    const finalResponse = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTHORIZATION_HEADER,
      },
    });

    const jsonFinalResponse = await finalResponse.json();
    if (jsonFinalResponse.status === "succeeded") {
      // bigcolor returns an array of outputs instead of a single one.
      if (Array.isArray(jsonFinalResponse.output)) {
        jsonFinalResponse.output.forEach((output: BigcolorOutput) => {
          enhancedImages.push(output.image);
        });
      } else {
        enhancedImages.push(jsonFinalResponse.output);
      }
    } else if (
      jsonFinalResponse.status === "failed" ||
      jsonFinalResponse.status === "canceled"
    ) {
      errorMessage = jsonFinalResponse.error;
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    }
  }

  if (!enhancedImages.length) {
    if (errorMessage) {
      throw new Error(
        `runReplicatePrediction: failed with body ${JSON.stringify(
          body,
          null,
          4
        )} and error message: ${errorMessage}`
      );
    } else {
      throw new Error(
        `runReplicatePrediction: canceled with body ${JSON.stringify(
          body,
          null,
          4
        )}`
      );
    }
  }

  return enhancedImages;
}

interface Result {
  url: string;
  model: string;
}

interface EnhancedImage {
  originalImage: UploadedImage;
  results: Result[];
}

export async function enhanceImages(effect: Effect, images: UploadedImage[]) {
  if (effect === Effect.WatermarkRemoval) {
    throw new Error("Watermark Removal not yet implemented");
  }

  const replicateVersion = getReplicateVersion(effect);
  try {
    const enhancedImages = await Promise.all(
      images.map(async (image) => {
        switch (replicateVersion) {
          case ReplicateVersion.maxim: {
            const models = getMaximModels(effect);
            const results = await Promise.all(
              models.map(async (model) => {
                const urls = await runReplicatePrediction({
                  version: ReplicateVersion.maxim,
                  input: {
                    model,
                    image: image.dataUrl,
                  },
                });

                return urls.map((url) => ({ model: `maxim - ${model}`, url }));
              })
            );

            return {
              results: results.flat(),
              originalImage: image,
            } as EnhancedImage;
          }

          case ReplicateVersion.bigcolor:
            const urls = await runReplicatePrediction({
              version: ReplicateVersion.bigcolor,
              input: {
                image: image.dataUrl,
                mode: "Real Gray Colorization",
                classes: "88",
              },
            });

            return {
              results: urls.map((url) => ({
                url,
                model: `bigcolor - Real Gray Colorization`,
              })),
              originalImage: image,
            } as EnhancedImage;

          case ReplicateVersion.gfpgan: {
            const urls = await runReplicatePrediction({
              version: ReplicateVersion.gfpgan,
              input: {
                img: image.dataUrl,
                version: "v1.4",
                scale: 2,
              },
            });

            return {
              results: urls.map((url) => ({ url, model: `gfpgan` })),
              originalImage: image,
            } as EnhancedImage;
          }

          case ReplicateVersion.swinir: {
            const urls = await runReplicatePrediction({
              version: ReplicateVersion.swinir,
              input: {
                image: image.dataUrl,
                task_type: "Real-World Image Super-Resolution-Large",
                noise: 15,
                jpeg: 40,
              },
            });

            return {
              results: urls.map((url) => ({
                url,
                model: `swinir - Real-World Image Super-Resolution-Large`,
              })),
              originalImage: image,
            } as EnhancedImage;
          }
        }
      })
    );

    return enhancedImages;
  } catch (error) {
    console.error(error);
    throw new Error("enhanceImages: Replicate failed to run predictions");
  }
}
