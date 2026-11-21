import { createAccountClient } from "@infoteam/account-react";
import { ACCOUNT_CLIENT_ID, ACCOUNT_ISSUER } from "astro:env/client";

import { client as apiClient } from "@/@types/api/client.gen";
import { API_URL } from "@/common/lib/api";

import { type SignupInput } from ".";

export function createAccount() {
  const account = createAccountClient<SignupInput>({
    issuer: ACCOUNT_ISSUER,
    clientId: ACCOUNT_CLIENT_ID,
    api: API_URL,
    app: "mpa",
  });
  apiClient.setConfig({ fetch: account.fetch });
  return account;
}
