// Storybook serves this file as `../account.ts`, where a relative import
// would resolve one folder too high; the alias doesn't move.
import { createAccount } from "@/features/auth/models/create-account";

// Storybook loads this in place of `../account` (`sb.mock` in
// .storybook/preview.tsx). A client restores its session only once, so each
// story gets a new one to restore the session its MSW handlers describe.
export let account = createAccount();

export function renewAccount() {
  account = createAccount();
}
