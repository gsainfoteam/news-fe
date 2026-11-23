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
      return error.reason === "consent_required" ? "consent" : "rejected";
    case "network":
      return "network";
    case "expired":
    case "unknown":
      return "unknown";
  }
}
