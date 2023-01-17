import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { prisma } from "~/lib/prisma.server";
import { useEnhancerDropzone } from "~/hooks/use-enhancer-dropzone";
import { AppIndexHeader } from "~/components/AppIndex/Header";
import { AppIndexUploadedImagesList } from "~/components/AppIndex/UploadedImagesList";
import { AppIndexDropzone } from "~/components/AppIndex/Dropzone";
import { AppIndexEnhanceForm } from "~/components/AppIndex/EnhanceForm";
import { requireUserId } from "~/lib/session.server";
import { z } from "zod";
import { isOverLimit } from "~/lib/rate-limiting.server";
import { Effect, enhanceImages } from "~/lib/enhancer.server";
import { uploadImage } from "~/lib/image-worker.server";
import { toast } from "react-hot-toast";
import { ErrorToast } from "~/components/ErrorToast";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
    },
  });

  if (!user) {
    throw redirect("/sign-out");
  }

  return json({
    credits: user.credits,
    effects: Object.values(Effect),
  });
}

const schema = z.object({
  effect: z.nativeEnum(Effect),
  images: z
    .array(
      z.object({
        dataUrl: z.string(),
        name: z.string(),
        sizeInMb: z.number().max(2),
      })
    )
    .max(5),
});

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      credits: true,
    },
  });

  if (!user) {
    throw redirect("/sign-out");
  }

  const body = await request.formData();
  const validation = await schema.safeParseAsync({
    effect: body.get("effect"),
    images: body.getAll("image").map((image) => JSON.parse(image.toString())),
  });

  if (!validation.success) {
    return json({ error: "Invalid data" }, { status: 400 });
  }

  // 3 requests within 1 minute max.
  const overLimit = await isOverLimit(
    request,
    {
      max: 3,
      windowInSeconds: 60,
    },
    user.id
  );

  if (overLimit) {
    return json(
      { error: "Wait a minute, you're making too many requests!" },
      { status: 429 }
    );
  }

  if (!user.credits) {
    return json({ error: "You don't have any credits." }, { status: 400 });
  }

  if (user.credits < validation.data.images.length) {
    return json(
      {
        error: `You don't have enough credits.`,
      },
      { status: 400 }
    );
  }

  try {
    const enhancedImages = await enhanceImages(
      validation.data.effect,
      validation.data.images
    );

    const uploadedImages = await Promise.all(
      enhancedImages.map(async (enhancedImage) => {
        const originalImageUrl = await uploadImage(
          enhancedImage.originalImage.dataUrl
        );

        const uploadedEnhancedImages = await Promise.all(
          enhancedImage.results.map(async (result) => {
            const response = await fetch(result.url);
            const contentType = response.headers.get("Content-Type");
            const buffer = Buffer.from(await response.arrayBuffer());
            const imageUrl = await uploadImage(
              "data:" + contentType + ";base64," + buffer.toString("base64")
            );
            return { ...result, url: imageUrl };
          })
        );

        return {
          originalImage: {
            name: enhancedImage.originalImage.name,
            url: originalImageUrl,
          },
          timeMetric: enhancedImage.timeMetric,
          results: uploadedEnhancedImages,
        };
      })
    );

    const imageEnhancements = await Promise.all(
      uploadedImages.map(async ({ originalImage, results, timeMetric }) => {
        return prisma.imageEnhancement.create({
          data: {
            userId: user.id,
            effect: validation.data.effect,
            originalImageName: originalImage.name,
            originalImageUrl: originalImage.url,
            timeMetric,
            results: {
              createMany: {
                data: results.map((result) => ({
                  url: result.url,
                  model: result.model,
                })),
              },
            },
          },
        });
      })
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        credits: {
          decrement: imageEnhancements.length,
        },
      },
    });

    if (imageEnhancements.length === 1) {
      return redirect(`/app/images?show_image_id=${imageEnhancements[0].id}`);
    }

    return redirect("/app/images");
  } catch (error) {
    console.error(error);
    return json(
      {
        error: "Something went wrong enhancing your images.",
      },
      { status: 500 }
    );
  }
}

interface ActionData {
  error?: string;
}

const maxImagesAllowed = 5;

export default function AppIndex() {
  const { effects, credits } = useLoaderData<typeof loader>();
  const imagesAllowed = credits > maxImagesAllowed ? maxImagesAllowed : credits;

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    uploadedImages,
    setUploadedImages,
  } = useEnhancerDropzone({ imagesAllowed });

  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData?.error) {
      toast.custom(
        (t) => (
          <ErrorToast t={t} title="Oops!" description={actionData.error!} />
        ),
        {
          duration: Infinity,
        }
      );
    }
  }, [actionData?.error]);

  const disabled = imagesAllowed === 0;

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 pt-8 sm:pt-20 sm:px-6 lg:px-8">
        <AppIndexHeader
          imagesAllowed={imagesAllowed}
          maxImagesAllowed={maxImagesAllowed}
        />
        <div className="my-14">
          <AppIndexDropzone
            getInputProps={getInputProps}
            getRootProps={getRootProps}
            isDragActive={isDragActive}
            disabled={disabled}
          />

          <AppIndexEnhanceForm
            effects={effects}
            uploadedImages={uploadedImages}
            disabled={disabled}
          />

          <AppIndexUploadedImagesList
            setUploadedImages={setUploadedImages}
            uploadedImages={uploadedImages}
          />
        </div>
      </main>
    </>
  );
}
