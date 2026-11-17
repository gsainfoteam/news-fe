import { type AccountError } from "../models";

export type LoginFailure =
  "cancelled" | "verification" | "consent" | "rejected" | "network" | "unknown";

export function getLoginFailure(
  error: Pick<AccountError, "code" | "details">,
): LoginFailure {
  switch (error.code) {
    case "user_cancelled":
    case "access_denied":
      return "cancelled";
    case "verification_required":
      return "verification";
    case "session_rejected":
      return isConsentRequired(error.details) ? "consent" : "rejected";
    case "network_error":
    case "discovery_failed":
    case "temporarily_unavailable":
      return "network";
    default:
      return "unknown";
  }
}

function isConsentRequired(details: unknown) {
  return (
    typeof details === "object" &&
    details !== null &&
    "reason" in details &&
    details.reason === "consent_required"
  );
}
