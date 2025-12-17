export type LicensePlan = "pro" | "demo";

export type LicensePayload = {
  email: string;
  plan: LicensePlan;
  exp: string; // YYYY-MM-DD
  iat: string; // YYYY-MM-DD
};

export type LicenseStatus = "checking" | "valid" | "invalid";

export type LicenseState = {
  key?: string;
  status: LicenseStatus;
  valid: boolean;
  payload: LicensePayload | null;
  error: string | null;
};
