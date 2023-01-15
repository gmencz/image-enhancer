import { Link } from "@remix-run/react";

interface AppIndexHeaderProps {
  limit: number;
  hasEnhancementsLimit: boolean;
}

export function AppIndexHeader({
  limit,
  hasEnhancementsLimit,
}: AppIndexHeaderProps) {
  return (
    <header className="sm:pt-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-5xl">
          Enhance your photos
        </h1>

        {hasEnhancementsLimit ? (
          <p className="mt-6 text-lg text-gray-600 sm:text-center">
            {limit === 0 ? (
              <>
                You don't have any free images left,{" "}
                <Link to="/app/account" className="text-purple-500 underline">
                  upgrade
                </Link>{" "}
                to get more.
              </>
            ) : (
              <>
                You have{" "}
                {limit === 1
                  ? `1 free image of max 2MB left`
                  : `${limit} free images of max 2MB each left`}
                ,{" "}
                <Link to="/app/account" className="text-purple-500 underline">
                  upgrade
                </Link>{" "}
                to get more.
              </>
            )}
          </p>
        ) : (
          <p className="mt-6 text-lg text-gray-600 sm:text-center">
            Up to {limit} images, max 2MB each.
          </p>
        )}
      </div>
    </header>
  );
}
