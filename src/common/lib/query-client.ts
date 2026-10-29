import { createElement, type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Each Astro island is its own React root, so a Provider per island would
// otherwise hold its own cache. Islands share this module, hence one cache.
export const queryClient = new QueryClient({
  // Islands hydrate at different times (client:visible); without a staleTime
  // a later island would refetch what an earlier one just loaded.
  defaultOptions: { queries: { staleTime: 60_000 } },
});

export function QueryProvider({ children }: QueryProvider.Props) {
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

export namespace QueryProvider {
  export type Props = {
    children: ReactNode;
  };
}
