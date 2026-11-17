import { createElement, type ReactNode } from "react";

import { AccountProvider, getAccountClient } from "../models";

export function AuthProvider({ fallback, children }: AuthProvider.Props) {
  return createElement(AccountProvider, {
    client: getAccountClient(),
    fallback,
    children,
  });
}

export namespace AuthProvider {
  export type Props = {
    fallback?: ReactNode;
    children: ReactNode;
  };
}
