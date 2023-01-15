import clsx from "clsx";
import type { DropzoneState } from "react-dropzone";

type AppIndexDropzoneProps = Pick<
  DropzoneState,
  "isDragActive" | "getRootProps" | "getInputProps"
> & {
  disabled: boolean;
};

export function AppIndexDropzone({
  getInputProps,
  getRootProps,
  isDragActive,
  disabled,
}: AppIndexDropzoneProps) {
  return (
    <div
      className={clsx(
        "w-full rounded-lg border-4 border-dashed border-gray-200 items-center justify-center py-14 flex flex-col",
        isDragActive && "border-gray-900",
        disabled && "blur-sm pointer-events-none"
      )}
      {...getRootProps()}
    >
      <label
        htmlFor="photos"
        className="inline-flex items-center rounded-md border border-transparent bg-purple-100 px-6 py-3 text-lg font-medium text-purple-700 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        Upload photos
        <input
          type="file"
          className="hidden"
          name="photos"
          id="photos"
          accept="image/png, image/jpeg"
          {...getInputProps({ disabled })}
        />
      </label>
      <p className="mt-6 text-base text-gray-500 text-center">
        ...or drop them here.
      </p>
    </div>
  );
}
