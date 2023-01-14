import type { UploadedPhoto } from "~/hooks/use-enhancer-dropzone";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface AppIndexUploadedPhotosListProps {
  uploadedPhotos: UploadedPhoto[];
  setUploadedPhotos: React.Dispatch<React.SetStateAction<UploadedPhoto[]>>;
}

export function AppIndexUploadedPhotosList({
  uploadedPhotos,
  setUploadedPhotos,
}: AppIndexUploadedPhotosListProps) {
  const removePhoto = (photo: UploadedPhoto) => {
    setUploadedPhotos((prev) =>
      prev.filter(({ file }) => file.name !== photo.file.name)
    );
  };

  return (
    <div className="mt-12">
      <p className="text-center mb-2 text-xl font-bold tracking-tight sm:text-center sm:text-2xl text-gray-900">
        {uploadedPhotos.length > 0
          ? `You uploaded ${
              uploadedPhotos.length === 1
                ? "1 photo"
                : `${uploadedPhotos.length} photos`
            }`
          : "You haven't uploaded any photos yet"}
      </p>

      <ul className="flex flex-wrap justify-center items-center gap-8 mt-4">
        {uploadedPhotos.map((uploadedPhoto) => (
          <li key={uploadedPhoto.file.name} className="relative">
            <img
              className="max-w-sm rounded shadow-lg w-full"
              src={uploadedPhoto.dataURL}
              alt=""
            />

            <button
              onClick={() => removePhoto(uploadedPhoto)}
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
