import { Form, useSubmit, useTransition } from "@remix-run/react";
import { BoltIcon } from "@heroicons/react/24/solid";
import { Select } from "../Select";
import type { UploadedPhoto } from "~/hooks/use-enhancer-dropzone";
import { useState } from "react";

interface AppIndexEnhanceFormProps {
  uploadedPhotos: UploadedPhoto[];
  effects: string[];
}

export function AppIndexEnhanceForm({
  uploadedPhotos,
  effects,
}: AppIndexEnhanceFormProps) {
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";
  const [effect, setEffect] = useState(effects[0]);
  const submit = useSubmit();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("effect", effect);

    uploadedPhotos.forEach((uploadedPhoto, index) => {
      formData.append("photo", uploadedPhoto.file);
    });

    submit(formData, { method: "post", encType: "multipart/form-data" });
  };

  return (
    <Form className="mt-4 flex" method="post" onSubmit={handleSubmit}>
      <div className="flex-1">
        <Select
          label="Effect"
          options={effects}
          selected={effect}
          setSelected={setEffect}
        />
      </div>

      <button
        type="submit"
        disabled={uploadedPhotos.length === 0 || isSubmitting}
        className="ml-4 self-end inline-flex items-center rounded-md border border-transparent bg-purple-600 disabled:bg-purple-300 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        <BoltIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
        Enhance
      </button>
    </Form>
  );
}
