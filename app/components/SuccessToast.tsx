import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import type { Toast } from "react-hot-toast";
import { toast } from "react-hot-toast";

interface SuccessToastProps {
  t: Toast;
  title: string;
  description: string;
}

export function SuccessToast({ t, title, description }: SuccessToastProps) {
  return (
    <div
      className={clsx(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5",
        t.visible ? "animate-enter" : "animate-leave"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircleIcon
              className="h-6 w-6 text-green-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              onClick={() => {
                toast.dismiss(t.id);
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
