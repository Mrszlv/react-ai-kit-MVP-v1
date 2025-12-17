import React from "react";
import { useLicense } from "./LicenseContext";
import { PaywallCard } from "../../components/PaywallCard/PaywallCard";

type GuardOptions = {
  title?: string;
  message?: string;
  reason?: string;
};

const LICENSE_URL = "https://t.me/@miroszlavpopovics"; // постав свій контакт/лендінг

export function withLicenseGuard<P extends object>(
  Wrapped: React.ComponentType<P>,
  options?: GuardOptions
): React.FC<P> {
  const ComponentWithGuard: React.FC<P> = (props) => {
    const { status, valid, error } = useLicense();

    if (status === "checking") return null;

    if (!valid) {
      const isDev =
        typeof import.meta !== "undefined" &&
        import.meta.env?.MODE === "development";

      return (
        <PaywallCard
          title={options?.title}
          message={
            options?.message ??
            "This component is available only with a valid @mrszlv/ai-ui-components license."
          }
          reason={
            options?.reason ??
            'Wrap your app with <LicenseProvider licenseKey="..." />.'
          }
          ctaHref={LICENSE_URL}
          ctaLabel="Get license"
          npmPackage="@mrszlv/ai-ui-components"
          debugReason={isDev ? error : null}
        />
      );
    }

    return <Wrapped {...props} />;
  };

  ComponentWithGuard.displayName = `WithLicenseGuard(${
    Wrapped.displayName || Wrapped.name || "Component"
  })`;

  return ComponentWithGuard;
}
