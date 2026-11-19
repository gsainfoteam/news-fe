import {
  type AccountClient,
  createAccountClient,
} from "@infoteam/account-react";
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

let account: AccountClient<SignupInput> | undefined;

export function getAccountClient() {
  if (!account) {
    account = createAccountClient<SignupInput>({
      issuer: ACCOUNT_ISSUER,
      clientId: ACCOUNT_CLIENT_ID,
      api: API_URL,
      silentLogin: false,
    });
    apiClient.setConfig({ fetch: account.fetch });
  }
  return account;
}

export function resetAccountClient() {
  account = undefined;
  apiClient.setConfig({ fetch: undefined });
}
