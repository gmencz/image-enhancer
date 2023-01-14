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
import { requireUser } from "~/lib/session.server";
import { z } from "zod";

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

  return json({ remainingEnhancements });
}

const effects = [
  "Deblur",
  "Denoise",
  "Derain",
  "Dehaze",
  "Lighten",
  "Retouch",
  "Watermark removal",
  "Colorize",
  "Face restoration",
];

const schema = z.object({
  effect: z.enum(effects as any),
  photos: z.array(z.instanceof(File)),
});

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  const validation = await schema.safeParseAsync({
    effect: body.get("effect"),
    photos: body.getAll("photo"),
  });

  if (!validation.success) {
    return json({ error: "Invalid data" }, { status: 400 });
  }

  const { effect, photos } = validation.data;

  // TODO

  return null;
}

export default function AppIndex() {
  const { remainingEnhancements } = useLoaderData<typeof loader>();

  const limit = remainingEnhancements
    ? remainingEnhancements > 20
      ? 20
      : remainingEnhancements
    : 20;

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    uploadedPhotos,
    setUploadedPhotos,
  } = useEnhancerDropzone({ limit });

  return (
    <>
      <AppIndexHeader remainingEnhancements={remainingEnhancements} />
      <main>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 my-14">
          <AppIndexDropzone
            getInputProps={getInputProps}
            getRootProps={getRootProps}
            isDragActive={isDragActive}
          />

          <AppIndexEnhanceForm
            effects={effects}
            uploadedPhotos={uploadedPhotos}
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
