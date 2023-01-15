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
import { requireUser } from "~/lib/session.server";
import { z } from "zod";
import { isOverLimit } from "~/lib/rate-limiting.server";
import { Effect, enhanceImages } from "~/lib/enhancer.server";
import { uploadImage } from "~/lib/image-worker.server";
import { toast } from "react-hot-toast";
import { ErrorToast } from "~/components/ErrorToast";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const plan = await prisma.plan.findFirst({
    where: { users: { some: { id: user.id } } },
    select: {
      enhancementsLimit: true,
    },
  });

  if (!plan) {
    throw new Error("This shouldn't happen");
  }

  const enhancementsCount = await prisma.imageEnhancement.count({
    where: {
      userId: user.id,
    },
  });

  let remainingEnhancements: number | null = null;
  if (plan.enhancementsLimit) {
    if (enhancementsCount >= plan.enhancementsLimit) {
      remainingEnhancements = 0;
    } else {
      remainingEnhancements = plan.enhancementsLimit - enhancementsCount;
    }
  }

  const maxLimit = 5;
  const limit = remainingEnhancements
    ? remainingEnhancements > maxLimit
      ? maxLimit
      : remainingEnhancements
    : maxLimit;

  return json({
    limit,
    effects: Object.values(Effect),
    hasEnhancementsLimit: !!plan.enhancementsLimit,
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
  const user = await requireUser(request);
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

  const plan = await prisma.plan.findFirst({
    where: { users: { some: { id: user.id } } },
    select: {
      enhancementsLimit: true,
    },
  });

  if (!plan) {
    return json(
      { error: "Something went wrong getting your plan" },
      { status: 500 }
    );
  }

  const enhancementsCount = await prisma.imageEnhancement.count({
    where: {
      userId: user.id,
    },
  });

  let remainingEnhancements: number | null = null;
  if (plan.enhancementsLimit) {
    if (enhancementsCount >= plan.enhancementsLimit) {
      remainingEnhancements = 0;
    } else {
      remainingEnhancements = plan.enhancementsLimit - enhancementsCount;
    }
  }

  if (remainingEnhancements === 0) {
    return json(
      { error: "You don't have any free images left, upgrade to get more." },
      { status: 400 }
    );
  }

  if (
    remainingEnhancements &&
    validation.data.images.length > remainingEnhancements
  ) {
    return json(
      {
        error: `You only have ${remainingEnhancements} free images left and you tried to enhance ${validation.data.images.length}, upgrade to get more.`,
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
          results: uploadedEnhancedImages,
        };
      })
    );

    await Promise.all(
      uploadedImages.map(async ({ originalImage, results }) => {
        return prisma.imageEnhancement.create({
          data: {
            userId: user.id,
            effect: validation.data.effect,
            originalImageName: originalImage.name,
            originalImageUrl: originalImage.url,
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
  } catch (error) {
    console.error(error);
    return json(
      {
        error: "Something went wrong enhancing your images.",
      },
      { status: 500 }
    );
  }

  return redirect("/app/images");
}

interface ActionData {
  error?: string;
}

export default function AppIndex() {
  const { limit, effects, hasEnhancementsLimit } =
    useLoaderData<typeof loader>();

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    uploadedImages,
    setUploadedImages,
  } = useEnhancerDropzone({ limit });

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

  const disabled = limit === 0;

  return (
    <>
      <AppIndexHeader
        limit={limit}
        hasEnhancementsLimit={hasEnhancementsLimit}
      />
      <main>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 my-14">
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
