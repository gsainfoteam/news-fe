import { createAccountClient } from "@infoteam/account-react";
import { ACCOUNT_CLIENT_ID, ACCOUNT_ISSUER } from "astro:env/client";

import { client as apiClient } from "@/@types/api/client.gen";
import { API_URL } from "@/common/lib/api";

import { type SignupInput } from "..";

export {
  AccountError,
  AccountProvider,
  RequireAuth as AccountGate,
  useAccount,
  type AccountClient,
  type AccountState,
  type UseAccountResult,
} from "@infoteam/account-react";

// Storybook loads this in place of `../account` (`sb.mock` in
// .storybook/preview.tsx). A client restores its session only once, so each
// story gets a new one to restore the session its MSW handlers describe.
export let account = createClient();

export function renewAccount() {
  account = createClient();
}

function createClient() {
  const client = createAccountClient<SignupInput>({
    issuer: ACCOUNT_ISSUER,
    clientId: ACCOUNT_CLIENT_ID,
    api: API_URL,
    app: "mpa",
  });
  apiClient.setConfig({ fetch: client.fetch });
  return client;
}
