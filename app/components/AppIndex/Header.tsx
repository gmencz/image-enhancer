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
    <header>
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl sm:text-center">
          Enhance your images
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
