import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

export function useMatchesData<Data>(id: string): Data {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}
