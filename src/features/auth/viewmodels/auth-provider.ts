import { createElement, type ReactNode } from "react";

import {
  AccountGate,
  AccountProvider,
  getAccountClient,
  type UseAccountResult,
} from "../models";

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

// Pages here show a login screen instead of sending the reader to the IdP.
export function AuthGate({ fallback, children }: AuthGate.Props) {
  return createElement(AccountGate, { redirect: false, fallback, children });
}

export namespace AuthGate {
  export type Props = {
    fallback: (account: UseAccountResult) => ReactNode;
    children: ReactNode;
  };
}
