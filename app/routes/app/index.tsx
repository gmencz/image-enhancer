import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Fragment } from "react";
import { prisma } from "~/lib/prisma.server";
import { useEnhancerDropzone } from "~/hooks/use-enhancer-dropzone";
import { AppIndexHeader } from "~/components/AppIndex/Header";
import { AppIndexUploadedPhotosList } from "~/components/AppIndex/UploadedPhotosList";
import { AppIndexDropzone } from "~/components/AppIndex/Dropzone";
import { AppIndexEnhanceForm } from "~/components/AppIndex/EnhanceForm";
import { requireUser, requireUserId } from "~/lib/session.server";
import { z } from "zod";
import { isOverLimit } from "~/lib/rate-limiting.server";
import { Effect, enhancePhotos } from "~/lib/enhancer.server";

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

  const enhancementsCount = await prisma.photoEnhancement.count({
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
  photos: z
    .array(
      z.object({
        dataURL: z.string(),
        name: z.string(),
        sizeInMb: z.number().max(2),
      })
    )
    .max(5),
});

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const body = await request.formData();
  const validation = await schema.safeParseAsync({
    effect: body.get("effect"),
    photos: body.getAll("photo").map((photo) => JSON.parse(photo.toString())),
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
    userId
  );

  if (overLimit) {
    return json(
      { error: "Wait a minute, you're making too many requests!" },
      { status: 429 }
    );
  }

  const enhancedPhotos = await enhancePhotos(
    validation.data.effect,
    validation.data.photos
  );

  // TODO: Upload to R2

  // enhancedPhotos[0].originalPhoto

  // await prisma.photoEnhancement.createMany({
  //   data: enhancedPhotos.map((_photo) => ({
  //     userId,
  //   })),
  // });

  return null;
}

export default function AppIndex() {
  const { limit, effects, hasEnhancementsLimit } =
    useLoaderData<typeof loader>();

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    uploadedPhotos,
    setUploadedPhotos,
  } = useEnhancerDropzone({ limit });

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
            uploadedPhotos={uploadedPhotos}
            disabled={disabled}
          />

          <AppIndexUploadedPhotosList
            setUploadedPhotos={setUploadedPhotos}
            uploadedPhotos={uploadedPhotos}
          />
        </div>
      </main>
    </>
  );
}
