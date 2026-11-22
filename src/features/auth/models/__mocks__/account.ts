import { createAccountClient } from "@infoteam/account-react";
import { ACCOUNT_CLIENT_ID, ACCOUNT_ISSUER } from "astro:env/client";

// Storybook serves this file at `../account.ts`'s path, so relative imports
// would resolve one folder too high.
import { client as apiClient } from "@/@types/api/client.gen";
import { API_URL } from "@/common/lib/api";
import { type SignupInput } from "@/features/auth/models";

// Storybook loads this in place of `../account` (`sb.mock` in
// .storybook/preview.tsx). A client restores its session only once, so each
// story gets a new one to restore the session its MSW handlers describe.
export let account = createAccount();

export function renewAccount() {
  account = createAccount();
}

function createAccount() {
  const client = createAccountClient<SignupInput>({
    issuer: ACCOUNT_ISSUER,
    clientId: ACCOUNT_CLIENT_ID,
    api: API_URL,
    app: "mpa",
  });
  apiClient.setConfig({ fetch: client.fetch });
  return client;
}
