import {
  type AccountClient,
  createAccountClient,
} from "@infoteam/account-react";
import { ACCOUNT_CLIENT_ID, ACCOUNT_ISSUER } from "astro:env/client";

import { client as apiClient } from "@/@types/api/client.gen";
import { API_URL } from "@/common/lib/api";

export {
  AccountError,
  AccountProvider,
  useAccount,
  type AccountClient,
  type AccountState,
} from "@infoteam/account-react";

let account: AccountClient | undefined;

// Created on first use, never at import: the SDK reads `window.location` and
// `sessionStorage` right away, and the build imports this module while
// rendering pages. One instance for the page, since every island is its own
// React root.
export function getAccountClient() {
  if (!account) {
    account = createAccountClient({
      issuer: ACCOUNT_ISSUER,
      clientId: ACCOUNT_CLIENT_ID,
      api: API_URL,
      // Logins only start from a click; `silentLogin` would bounce every
      // visitor without a session through the IdP once per tab.
      silentLogin: false,
    });
    // Browser requests from then on carry the access token, and a 401
    // refreshes the session once and resends. The build never gets here, so
    // build-time requests stay anonymous.
    apiClient.setConfig({ fetch: account.fetch });
  }
  return account;
}

// Stories and tests only: the next story must not inherit the last one's
// session.
export function resetAccountClient() {
  account = undefined;
  apiClient.setConfig({ fetch: undefined });
}
