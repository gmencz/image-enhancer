import { Form, useTransition } from "@remix-run/react";
import { BoltIcon } from "@heroicons/react/24/solid";
import { Select } from "../Select";
import type { UploadedImage } from "~/hooks/use-enhancer-dropzone";
import { useState } from "react";
import clsx from "clsx";
import { Spinner } from "../Spinner";

interface AppIndexEnhanceFormProps {
  uploadedImages: UploadedImage[];
  effects: string[];
  disabled: boolean;
}

export function AppIndexEnhanceForm({
  uploadedImages,
  effects,
  disabled,
}: AppIndexEnhanceFormProps) {
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";
  const [effect, setEffect] = useState(effects[0]);

  return (
    <Form
      className={clsx("mt-4", disabled && "blur-sm pointer-events-none")}
      method="post"
    >
      <div className="flex-1">
        <Select
          label="Effect"
          description="Some effects may take up to 10 minutes to run so we ask you to be patient. You also don't have to stay on this tab for them to complete."
          options={effects}
          selected={effect}
          setSelected={setEffect}
        />
      </div>

      <button
        type="submit"
        disabled={uploadedImages.length === 0 || isSubmitting || disabled}
        className="mt-4 inline-flex items-center rounded-md border border-transparent bg-purple-600 disabled:bg-purple-300 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        {isSubmitting ? (
          <>
            <Spinner
              className="-ml-1 mr-3 h-5 w-5 text-white"
              aria-hidden="true"
            />
            Enhancing...
          </>
        ) : (
          <>
            <BoltIcon
              className="-ml-1 mr-3 h-5 w-5 text-white"
              aria-hidden="true"
            />
            Enhance
          </>
        )}
      </button>

      <input type="hidden" name="effect" value={effect} />

      {uploadedImages.map((image) => (
        <input
          key={image.name}
          type="hidden"
          name="image"
          value={JSON.stringify(image)}
        />
      ))}
    </Form>
  );
}
