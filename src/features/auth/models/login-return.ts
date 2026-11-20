const RETURN_TO_KEY = "news:login-return-to";

// After an `app: 'mpa'` callback fails, the address bar holds only
// /auth/callback and the SDK doesn't expose the page the login started on.
// The callback page needs it for its language and its back link.
export function rememberReturnTo(href: string) {
  try {
    sessionStorage.setItem(RETURN_TO_KEY, href);
  } catch {
    // Blocked storage: the callback page falls back to Korean and home.
  }
}

export function readReturnTo() {
  try {
    return sessionStorage.getItem(RETURN_TO_KEY);
  } catch {
    return null;
  }
}
