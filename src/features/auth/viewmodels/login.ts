import { type AccountClient, rememberReturnTo } from "../models";

export function loginFrom(
  login: AccountClient["login"],
  returnTo = window.location.href,
) {
  rememberReturnTo(returnTo);
  // A failed login stays in the SDK's `error`, which the views read.
  return login({ returnTo }).catch(() => undefined);
}
