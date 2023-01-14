import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { ErrorToast } from "~/components/ErrorToast";

export interface UploadedPhoto {
  dataURL: string;
  file: File;
}

interface UseEnhancerDropzone {
  limit: number;
}

export function useEnhancerDropzone({ limit }: UseEnhancerDropzone) {
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  const dropzoneState = useDropzone({
    onDrop: (acceptedFiles) => {
      let uploadedDuplicates = false;
      let limitReached = false;
      acceptedFiles.forEach((file) => {
        const alreadyUploaded = uploadedPhotos.some(
          (uploadedPhoto) => uploadedPhoto.file.name === file.name
        );

        if (alreadyUploaded) {
          uploadedDuplicates = true;
          return;
        }

        if (uploadedPhotos.length >= limit) {
          limitReached = true;
          return;
        }

        const reader = new FileReader();

        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading has failed");
        reader.onload = () => {
          const dataURL = reader.result as string;
          setUploadedPhotos((prev) => [...prev, { dataURL, file }]);
        };

        reader.readAsDataURL(file);
      });

      if (uploadedDuplicates) {
        toast.custom((t) => (
          <ErrorToast
            t={t}
            title="Oops!"
            description="You tried to upload some images that were already uploaded."
          />
        ));
      }

      if (limitReached) {
        toast.custom((t) => (
          <ErrorToast
            t={t}
            title="Oops!"
            description={`You can't upload more photos per enhancement on your current plan.`}
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
    },
  });

  return { ...dropzoneState, uploadedPhotos, setUploadedPhotos };
}
