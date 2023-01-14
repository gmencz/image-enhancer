interface AppIndexHeaderProps {
  remainingEnhancements: number | null;
}

export function AppIndexHeader({ remainingEnhancements }: AppIndexHeaderProps) {
  return (
    <header className="sm:pt-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-5xl">
          Enhance your photos
        </h1>
        {remainingEnhancements === null ? null : (
          <p className="mt-6 text-lg text-gray-600 sm:text-center">
            {remainingEnhancements} photo enhancements remaining on your current
            plan.
          </p>
        )}
      </div>
    </header>
  );
}
