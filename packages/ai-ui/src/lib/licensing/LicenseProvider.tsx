import React, { useMemo } from "react";
import type { LicenseState } from "./types";
import { verifyLicense } from "./checkLicense";
import { LicenseContext } from "./LicenseContext";

type LicenseProviderProps = {
  licenseKey?: string;
  children: React.ReactNode;
};

export function LicenseProvider({
  licenseKey,
  children,
}: LicenseProviderProps) {
  const state = useMemo<LicenseState>(() => {
    const res = verifyLicense(licenseKey);

    const valid = res.valid;
    return {
      key: licenseKey?.trim(),
      valid,
      status: valid ? "valid" : "invalid",
      payload: valid ? res.payload : null,
      error: valid ? null : res.error,
    };
  }, [licenseKey]);

  return (
    <LicenseContext.Provider value={state}>{children}</LicenseContext.Provider>
  );
}
