import { createAccountClient } from "@infoteam/account-react";
import { ACCOUNT_CLIENT_ID, ACCOUNT_ISSUER } from "astro:env/client";

import { client as apiClient } from "@/@types/api/client.gen";
import { API_URL } from "@/common/lib/api";

import { type SignupInput } from ".";

export {
  AccountError,
  AccountProvider,
  useAccount,
  type AccountClient,
  type AccountState,
} from "@infoteam/account-react";

function createClient() {
  const client = createAccountClient<SignupInput>({
    issuer: ACCOUNT_ISSUER,
    clientId: ACCOUNT_CLIENT_ID,
    api: API_URL,
    silentLogin: false,
  });
  apiClient.setConfig({ fetch: client.fetch });
  return client;
}

let account = createClient();

export function getAccountClient() {
  return account;
}

// Stories and tests start each case from a fresh session.
export function resetAccountClient() {
  account = createClient();
}
