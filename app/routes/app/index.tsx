import type { User } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Fragment } from "react";
import { prisma } from "~/lib/prisma.server";
import { useMatchesData } from "~/utils";
import { useEnhancerDropzone } from "~/hooks/use-enhancer-dropzone";
import { AppIndexHeader } from "~/components/AppIndex/Header";
import { AppIndexUploadedPhotosList } from "~/components/AppIndex/UploadedPhotosList";
import { AppIndexDropzone } from "~/components/AppIndex/Dropzone";
import { AppIndexEnhanceForm } from "~/components/AppIndex/EnhanceForm";
import { requireUser, requireUserId } from "~/lib/session.server";

interface LayoutData {
  user: User;
}

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

export default function AppIndex() {
  const { user } = useMatchesData<LayoutData>("routes/app");
  const { remainingEnhancements } = useLoaderData<typeof loader>();
  const limit = 1;
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    uploadedPhotos,
    setUploadedPhotos,
  } = useEnhancerDropzone({ limit });

  console.log({ remainingEnhancements });

  return (
    <>
      <AppIndexHeader remainingEnhancements={remainingEnhancements} />
      <main>
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 my-14">
          <AppIndexDropzone
            getInputProps={getInputProps}
            getRootProps={getRootProps}
            isDragActive={isDragActive}
          />

          <AppIndexEnhanceForm />

          <AppIndexUploadedPhotosList
            setUploadedPhotos={setUploadedPhotos}
            uploadedPhotos={uploadedPhotos}
          />
        </div>
      </main>
    </>
  );
}
