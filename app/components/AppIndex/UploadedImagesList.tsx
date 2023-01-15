import type { UploadedImage } from "~/hooks/use-enhancer-dropzone";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface AppIndexUploadedImagesListProps {
  uploadedImages: UploadedImage[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
}

export function AppIndexUploadedImagesList({
  uploadedImages,
  setUploadedImages,
}: AppIndexUploadedImagesListProps) {
  const removeImage = (image: UploadedImage) => {
    setUploadedImages((prev) => prev.filter(({ name }) => name !== image.name));
  };

  return (
    <div className="mt-12">
      <ul className="flex flex-wrap justify-center items-center gap-8 mt-4">
        {uploadedImages.map((uploadedImage) => (
          <li key={uploadedImage.name} className="relative">
            <img
              className="max-w-sm rounded shadow-lg w-full"
              src={uploadedImage.dataUrl}
              alt=""
            />

            <button
              onClick={() => removeImage(uploadedImage)}
              className="flex items-center justify-center absolute -top-2 -left-2 bg-purple-600 rounded-full h-8 w-8 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <XMarkIcon className="h-5 w-5 text-white" />
              <span className="sr-only">Remove</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
