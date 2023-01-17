import { Link } from "@remix-run/react";

interface AppIndexHeaderProps {
  imagesAllowed: number;
  maxImagesAllowed: number;
}

export function AppIndexHeader({
  imagesAllowed,
  maxImagesAllowed,
}: AppIndexHeaderProps) {
  return (
    <header>
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl sm:text-center">
          Enhance your images
        </h1>

        <p className="mt-6 text-lg text-gray-600 sm:text-center">
          {imagesAllowed === 0 ? (
            <>
              You don't have any credits,{" "}
              <Link to="/app/account" className="text-purple-500 underline">
                buy more here
              </Link>
              .
            </>
          ) : imagesAllowed === maxImagesAllowed ? (
            <>Up to {imagesAllowed} images, max 2MB each.</>
          ) : (
            <>
              You have{" "}
              {imagesAllowed === 1
                ? `1 credit (1 image of max 2MB) left`
                : `${imagesAllowed} credits (${imagesAllowed} images of max 2MB each) left`}
              ,{" "}
              <Link to="/app/account" className="text-purple-500 underline">
                buy more here
              </Link>
              .
            </>
          )}
        </p>
      </div>
    </header>
  );
}
