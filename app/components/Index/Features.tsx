import { Link } from "@remix-run/react";

export const featuresImages = [
  {
    name: "Deblurring",
    before: "/features/deblur-before.png",
    after: "/features/deblur-after.png",
  },
  {
    name: "Retouching",
    before: "/features/retouch-before.png",
    after: "/features/retouch-after.png",
  },
  {
    name: "Deraining",
    before: "/features/derain-before.png",
    after: "/features/derain-after.png",
  },
  {
    name: "Dehazing",
    before: "/features/dehazing-before.png",
    after: "/features/dehazing-after.png",
  },
  {
    name: "Watermark Removal",
    before: "/features/watermark-before.png",
    after: "/features/watermark-after.png",
  },
];

export function Features() {
  return (
    <div className="relative bg-gray-50 pt-24 sm:pt-32 lg:pt-40" id="features">
      <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
        <div>
          <h2 className="text-lg font-semibold text-purple-600">Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Here's some of the things you can do
          </p>
          <p className="mx-auto mt-5 max-w-prose text-xl text-gray-600">
            With our image enhancing AI you can do just about anything you can
            think of.
          </p>
        </div>
        <ul className="mt-12 flex flex-col gap-12">
          {featuresImages.map(({ before, after, name }) => (
            <li key={name} className="flex items-center justify-center gap-6">
              <div className="flex flex-col gap-4">
                <img
                  className="rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 w-full max-w-md"
                  src={before}
                  alt=""
                />

                <div className="space-y-1 text-lg font-medium leading-6">
                  <p className="text-purple-600 font-bold">{name} Effect</p>
                  <p className="text-gray-900">Before</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <img
                  className="rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 w-full max-w-md"
                  src={after}
                  alt=""
                />
                <div className="space-y-1 text-lg font-medium leading-6">
                  <p className="text-purple-600 font-bold">{name} Effect</p>
                  <p className="text-gray-900">After</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-purple-100 mt-16">
        <div className="mx-auto max-w-7xl py-12 px-6 lg:flex lg:items-center lg:justify-between lg:py-24 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            <span className="block">And much more.</span>
            <span className="block text-purple-600">
              Start enhancing photos today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-5 py-3 text-base font-medium text-white hover:bg-purple-700"
              >
                Get started for free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
