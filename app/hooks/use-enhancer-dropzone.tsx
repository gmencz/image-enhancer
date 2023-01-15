import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { ErrorToast } from "~/components/ErrorToast";
import { blobToDataUrl } from "~/lib/files";

export interface UploadedImage {
  dataUrl: string;
  name: string;
  sizeInMb: number;
}

interface UseEnhancerDropzone {
  limit: number;
}

export function useEnhancerDropzone({ limit }: UseEnhancerDropzone) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const dropzoneState = useDropzone({
    disabled: limit === 0,
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        // Max 2MB per file
        const sizeInMb = file.size / 1000000;
        if (sizeInMb > 2) {
          toast.custom((t) => (
            <ErrorToast
              t={t}
              title="Oops!"
              description={`Some images weren't uploaded because they exceeded the 2MB size limit.`}
            />
          ));

          break;
        }

        if (uploadedImages.length >= limit) {
          toast.custom((t) => (
            <ErrorToast
              t={t}
              title="Oops!"
              description={`You've reached the limit of images you can upload.`}
            />
          ));

          break;
        }

        const alreadyUploaded = uploadedImages.some(
          (uploadedImage) => uploadedImage.name === file.name
        );

        if (alreadyUploaded) {
          toast.custom((t) => (
            <ErrorToast
              t={t}
              title="Oops!"
              description="You tried to upload some images that were already uploaded."
            />
          ));

          break;
        }

        const dataUrl = await blobToDataUrl(file);
        setUploadedImages((prev) => [
          ...prev,
          { dataUrl, name: file.name, sizeInMb },
        ]);
      }
    },
    onDropRejected: () => {
      toast.custom((t) => (
        <ErrorToast
          t={t}
          title="Oops!"
          description="You can only upload images."
        />
      ));
    },
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg"],
      "image/webp": [".webp"],
    },
  });

  return { ...dropzoneState, uploadedImages, setUploadedImages };
}
