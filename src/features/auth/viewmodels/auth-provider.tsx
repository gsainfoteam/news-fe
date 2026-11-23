import { type ReactNode } from "react";

import { account, AccountProvider } from "../models";

export function AuthProvider({ fallback, children }: AuthProvider.Props) {
  return (
    <AccountProvider client={account} fallback={fallback}>
      {children}
    </AccountProvider>
  );
}

export namespace AuthProvider {
  export type Props = {
    fallback?: ReactNode;
    children: ReactNode;
  };
}
