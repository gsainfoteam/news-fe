import { type AccountError } from "../models";

export type LoginFailure =
  "cancelled" | "verification" | "consent" | "rejected" | "network" | "unknown";

export function getLoginFailure(error: AccountError): LoginFailure {
  switch (error.kind) {
    case "cancelled":
      return "cancelled";
    case "verification":
      return "verification";
    case "rejected":
      return isConsentRequired(error) ? "consent" : "rejected";
    case "network":
      return "network";
    case "expired":
    case "unknown":
      return "unknown";
  }
}

// news-be puts the reason under `details`, not at the top level of the 403
// body where the SDK reads `reason` from.
function isConsentRequired({ reason, details }: AccountError.Rejected) {
  return (
    reason === "consent_required" ||
    (typeof details === "object" &&
      details !== null &&
      "reason" in details &&
      details.reason === "consent_required")
  );
}
