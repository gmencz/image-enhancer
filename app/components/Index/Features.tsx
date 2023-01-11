export const featuresImages = [
  {
    name: "Deblur",
    before: "/features/deblur-before.png",
    after: "/features/deblur-after.png",
  },
  {
    name: "Retouch",
    before: "/features/retouch-before.png",
    after: "/features/retouch-after.png",
  },
];

export function Features() {
  return (
    <div className="relative bg-gray-50 py-24 sm:py-32 lg:py-40" id="features">
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
              <img
                className="rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 w-full max-w-xl"
                src={before}
                alt=""
              />

              <img
                className="rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 w-full max-w-xl"
                src={after}
                alt=""
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
