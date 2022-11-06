import invariant from "tiny-invariant";
import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

export function useOptionalUserName(): string | undefined {
  const data = useMatchesData("root");
  if (!data) {
    return undefined;
  }
  return data.userName as string | undefined;
}

export function useUserName() {
  let userName = useOptionalUserName();
  invariant(userName, "userName is null");
  return userName;
}
