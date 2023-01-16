import { Link } from "@remix-run/react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

interface ImageEnhancementsMasonryProps {
  imageEnhancements: {
    id: number;
    originalImageName: string;
    effect: string;
    originalImageUrl: string;
    _count: {
      results: number;
    };
  }[];
}

export function ImageEnhancementsMasonry({
  imageEnhancements,
}: ImageEnhancementsMasonryProps) {
  return (
    <ResponsiveMasonry columnsCountBreakPoints={{ 1: 1, 375: 2, 640: 3 }}>
      <Masonry gutter="2rem">
        {imageEnhancements.map((imageEnhancement) => (
          <div key={imageEnhancement.id}>
            <div
              className={
                "relative focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-purple-500 group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden"
              }
            >
              <img
                src={imageEnhancement.originalImageUrl}
                alt={`Result 1`}
                className={
                  "group-hover:opacity-75 object-cover pointer-events-none w-full"
                }
              />
              <Link
                to={`?show_image_id=${imageEnhancement.id}`}
                className="absolute inset-0 focus:outline-none"
              >
                <span className="sr-only">
                  View details for {imageEnhancement.originalImageName}
                </span>
              </Link>
            </div>
            <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
              {imageEnhancement.originalImageName}
            </p>
            <p className="pointer-events-none block text-sm font-medium text-gray-500">
              {imageEnhancement.effect} -{" "}
              {imageEnhancement._count.results === 1
                ? `1 result`
                : `${imageEnhancement._count.results} results`}
            </p>
          </div>
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
}
