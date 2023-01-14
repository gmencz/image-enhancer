import { Form } from "@remix-run/react";
import { BoltIcon } from "@heroicons/react/24/solid";
import { Select } from "../Select";

export function AppIndexEnhanceForm() {
  return (
    <Form className="mt-4 flex" method="post">
      <div className="flex-1">
        <Select
          label="Effect"
          options={[
            "Deblur",
            "Denoise",
            "Derain",
            "Dehaze",
            "Lighten",
            "Retouch",
            "Watermark removal",
            "Colorize",
            "Face restoration",
          ]}
        />
      </div>

      <button
        type="button"
        className="ml-4 self-end inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        <BoltIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
        Enhance
      </button>
    </Form>
  );
}
