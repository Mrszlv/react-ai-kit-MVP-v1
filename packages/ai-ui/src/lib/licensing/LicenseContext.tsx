import { createContext, useContext } from "react";
import type { LicenseState } from "./types";

export const LicenseContext = createContext<LicenseState>({
  key: undefined,
  valid: false,
  status: "invalid",
  payload: null,
  error: "NO_PROVIDER",
});

export function useLicense(): LicenseState {
  return useContext(LicenseContext);
}
