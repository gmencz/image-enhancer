import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { ErrorToast } from "~/components/ErrorToast";

export interface UploadedPhoto {
  dataURL: string;
  name: string;
  sizeInMb: number;
}

interface UseEnhancerDropzone {
  limit: number;
}

export function useEnhancerDropzone({ limit }: UseEnhancerDropzone) {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  const dropzoneState = useDropzone({
    disabled: limit === 0,
    onDrop: (acceptedFiles) => {
      let uploadedDuplicates = false;
      let limitReached = false;
      let tooBig = false;
      acceptedFiles.forEach((file) => {
        // Max 2MB per file
        const sizeInMb = file.size / 1000000;
        if (sizeInMb > 2) {
          tooBig = true;
          return;
        }

        if (uploadedPhotos.length >= limit) {
          limitReached = true;
          return;
        }

        const alreadyUploaded = uploadedPhotos.some(
          (uploadedPhoto) => uploadedPhoto.name === file.name
        );

        if (alreadyUploaded) {
          uploadedDuplicates = true;
          return;
        }

        const reader = new FileReader();

        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading has failed");
        reader.onload = () => {
          const dataURL = reader.result as string;
          setUploadedPhotos((prev) => [
            ...prev,
            { dataURL, name: file.name, sizeInMb },
          ]);
        };

        reader.readAsDataURL(file);
      });

      if (uploadedDuplicates) {
        toast.custom((t) => (
          <ErrorToast
            t={t}
            title="Oops!"
            description="You tried to upload some photos that were already uploaded."
          />
        ));
      }

      if (limitReached) {
        toast.custom((t) => (
          <ErrorToast
            t={t}
            title="Oops!"
            description={`You've reached the limit of photos you can upload.`}
          />
        ));
      }

      if (tooBig) {
        toast.custom((t) => (
          <ErrorToast
            t={t}
            title="Oops!"
            description={`Some photos weren't uploaded because they exceeded the 2MB size limit.`}
          />
        ));
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

  return { ...dropzoneState, uploadedPhotos, setUploadedPhotos };
}
