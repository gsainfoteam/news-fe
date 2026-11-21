import { createElement, type ReactNode } from "react";

import { account, AccountProvider } from "../models";

export function AuthProvider({ fallback, children }: AuthProvider.Props) {
  return createElement(AccountProvider, {
    client: account,
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
