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
      <ul className="flex flex-wrap gap-8 mt-4">
        {uploadedImages.map((uploadedImage) => (
          <li key={uploadedImage.name} className="relative">
            <img
              className="max-w-sm rounded shadow-lg w-full"
              src={uploadedImage.dataUrl}
              alt=""
            />

            <button
              onClick={() => removeImage(uploadedImage)}
              className="flex items-center justify-center absolute -top-2 -left-2 bg-gray-50 rounded-full h-8 w-8 focus:outline-none ring-2 ring-purple-500 ring-offset-2 hover:scale-110"
            >
              <XMarkIcon className="h-5 w-5 text-purple-600" />
              <span className="sr-only">Remove</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
