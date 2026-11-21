import { type AccountClient } from "../models";

export function loginFrom(login: AccountClient["login"], returnTo?: string) {
  // A failed login stays in the SDK's `error`, which the views read.
  return login({ returnTo }).catch(() => undefined);
}
