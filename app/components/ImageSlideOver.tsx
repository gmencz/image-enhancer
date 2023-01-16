import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { HeartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { HeartIcon as SolidHeartIcon } from "@heroicons/react/24/solid";
import {
  Form,
  useLoaderData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import type { ImagesLoader } from "~/routes/app/images";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { SuccessToast } from "./SuccessToast";

export function ImageSlideOver() {
  const { slideOverImage: fetchedSlideOverImage } =
    useLoaderData<ImagesLoader>();
  const [slideOverImage, setSlideOverImage] = useState(fetchedSlideOverImage);
  const [searchParams, setSearchParams] = useSearchParams();
  const show = searchParams.has("show_image_id") && !!slideOverImage;
  const transition = useTransition();

  useEffect(() => {
    if (slideOverImage) {
      if (transition.type === "actionRedirect") {
        if (
          transition.submission.action ===
          `/app/images/${slideOverImage.id}/favorite`
        ) {
          toast.custom(
            (t) => (
              <SuccessToast
                t={t}
                title="Added to favorites"
                description={`Image ${slideOverImage?.originalImageName} has been added to favorites.`}
              />
            ),
            { position: "bottom-center" }
          );
        } else if (
          transition.submission.action ===
          `/app/images/${slideOverImage.id}/unfavorite`
        ) {
          toast.custom(
            (t) => (
              <SuccessToast
                t={t}
                title="Removed from favorites"
                description={`Image ${slideOverImage?.originalImageName} has been removed from favorites.`}
              />
            ),
            { position: "bottom-center" }
          );
        }
      }
    }
  }, [slideOverImage, transition.submission?.action, transition.type]);

  // This way we can keep the details visible while the modal transitions to a closed state.
  useEffect(() => {
    if (fetchedSlideOverImage) {
      setSlideOverImage(fetchedSlideOverImage);
    }
  }, [fetchedSlideOverImage]);

  const close = () => {
    searchParams.delete("show_image_id");
    setSearchParams(searchParams);
  };

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-full max-w-[30rem]">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={close}
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-full overflow-y-auto bg-white p-8">
                    {slideOverImage ? (
                      <>
                        <div className="space-y-6">
                          <div>
                            <div className="block w-full overflow-hidden rounded-lg">
                              <img
                                src={slideOverImage.originalImageUrl}
                                alt=""
                                className="object-cover w-full"
                              />
                            </div>
                            <div className="mt-4">
                              <h2 className="text-lg font-medium text-gray-900">
                                Original image
                                <span className="sr-only">
                                  Details for original image
                                </span>
                              </h2>
                              <p className="text-sm font-medium text-gray-500">
                                {slideOverImage.originalImageName}
                              </p>
                            </div>
                          </div>
                          <div className="border-t border-t-gray-200">
                            <Form
                              action={
                                slideOverImage.favorited
                                  ? `/app/images/${slideOverImage.id}/unfavorite`
                                  : `/app/images/${slideOverImage.id}/favorite`
                              }
                              method="post"
                              replace
                              className="mt-4 flex items-start justify-between"
                            >
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  Enhancement results
                                </h3>
                              </div>

                              <button
                                type="submit"
                                className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                {slideOverImage.favorited ? (
                                  <SolidHeartIcon
                                    className="h-6 w-6 text-purple-500"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <HeartIcon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                )}

                                <span className="sr-only">
                                  {slideOverImage.favorited
                                    ? "Unfavorite"
                                    : "Favorite"}
                                </span>
                              </button>
                            </Form>
                            <div className="mt-2 flex flex-col gap-4">
                              {slideOverImage.results.map((result, index) => (
                                <div
                                  key={result.id}
                                  className="block w-full overflow-hidden rounded-lg"
                                >
                                  <img
                                    src={result.url}
                                    alt={`Result ${index + 1}`}
                                    className="object-cover w-full"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Enhancement details
                            </h3>
                            <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                              <div className="flex justify-between py-3 text-sm font-medium">
                                <dt className="text-gray-500">Effect</dt>
                                <dd className="text-gray-900">
                                  {slideOverImage.effect}
                                </dd>
                              </div>
                              <div className="flex justify-between py-3 text-sm font-medium">
                                <dt className="text-gray-500">Created</dt>
                                <dd className="text-gray-900">
                                  {format(
                                    new Date(slideOverImage.createdAt),
                                    "MMMM d, yyyy"
                                  )}
                                </dd>
                              </div>
                              <div className="flex justify-between py-3 text-sm font-medium">
                                <dt className="text-gray-500">AI Took</dt>
                                <dd className="text-gray-900">
                                  {slideOverImage.timeMetric
                                    ? `${Math.round(
                                        slideOverImage.timeMetric
                                      )}s`
                                    : "Unknown"}
                                </dd>
                              </div>

                              <div className="flex justify-between py-3 text-sm font-medium">
                                <dt className="text-gray-500">Results</dt>
                                <dd className="text-gray-900">
                                  {slideOverImage.results.length}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Loading details...
                        </Dialog.Title>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
