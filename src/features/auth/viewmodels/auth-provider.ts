import { createElement, type ReactNode } from "react";

import { AccountProvider, getAccountClient } from "../models";

// Each Astro island is its own React root, so every island that reads the
// session wraps itself in this. They all hand over the one page-wide client,
// which restores the session once and shares it.
export function AuthProvider({ fallback, children }: AuthProvider.Props) {
  return createElement(AccountProvider, {
    client: getAccountClient(),
    fallback,
    children,
  });
}

export namespace AuthProvider {
  export type Props = {
    /** Shown instead of children while an IdP redirect is being finished. */
    fallback?: ReactNode;
    children: ReactNode;
  };
}
