import invariant from "tiny-invariant";
import type { UploadedPhoto } from "~/hooks/use-enhancer-dropzone";

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

  // GET request to get the status of the photo enhancement process & return the result when it's ready
  let enhancedPhoto: string | null = null;
  let errorMessage: string | null = null;
  while (!enhancedPhoto) {
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
      enhancedPhoto = jsonFinalResponse.output;
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

  if (!enhancedPhoto) {
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

  return enhancedPhoto;
}

interface Result {
  url: string;
  model: string;
}

interface EnhancedPhoto {
  originalPhoto: UploadedPhoto;
  results: Result[];
}

export async function enhancePhotos(effect: Effect, photos: UploadedPhoto[]) {
  if (effect === Effect.WatermarkRemoval) {
    throw new Error("Watermark Removal not yet implemented");
  }

  const replicateVersion = getReplicateVersion(effect);
  try {
    const enhancedPhotos = await Promise.all(
      photos.map(async (photo) => {
        switch (replicateVersion) {
          case ReplicateVersion.maxim: {
            const models = getMaximModels(effect);
            const results: Result[] = await Promise.all(
              models.map(async (model) => {
                const url = await runReplicatePrediction({
                  version: ReplicateVersion.maxim,
                  input: {
                    model,
                    image: photo.dataURL,
                  },
                });

                return { model: `maxim - ${model}`, url };
              })
            );

            return {
              results,
              originalPhoto: photo,
            } as EnhancedPhoto;
          }

          case ReplicateVersion.bigcolor:
            const url = await runReplicatePrediction({
              version: ReplicateVersion.bigcolor,
              input: {
                image: photo.dataURL,
                mode: "Real Gray Colorization",
                classes: "88",
              },
            });

            return {
              results: [{ url, model: `bigcolor - Real Gray Colorization` }],
              originalPhoto: photo,
            } as EnhancedPhoto;

          case ReplicateVersion.gfpgan: {
            const url = await runReplicatePrediction({
              version: ReplicateVersion.gfpgan,
              input: {
                img: photo.dataURL,
                version: "v1.4",
                scale: 2,
              },
            });

            return {
              results: [{ url, model: `gfpgan` }],
              originalPhoto: photo,
            } as EnhancedPhoto;
          }

          case ReplicateVersion.swinir: {
            const url = await runReplicatePrediction({
              version: ReplicateVersion.swinir,
              input: {
                image: photo.dataURL,
                task_type: "Real-World Image Super-Resolution-Large",
                noise: 15,
                jpeg: 40,
              },
            });

            return {
              results: [
                {
                  url,
                  model: `swinir - Real-World Image Super-Resolution-Large`,
                },
              ],
              originalPhoto: photo,
            } as EnhancedPhoto;
          }
        }
      })
    );

    return enhancedPhotos;
  } catch (error) {
    console.error(error);
    throw new Error("enhancePhotos: Replicate failed to run predictions");
  }
}
