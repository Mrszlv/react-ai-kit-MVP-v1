import React from "react";

type PaywallCardProps = {
  title?: string;
  message?: string;
  reason?: string;

  /** Куди вести юзера за ліцензією (сайт/телеграм/checkout) */
  ctaHref?: string;
  ctaLabel?: string;

  /** Показати npm package name, щоб було що інсталити */
  npmPackage?: string;

  /** Показувати технічну причину тільки в dev */
  debugReason?: string | null;
};

const DEFAULT_CTA = "https://t.me/miroszlavpopovics";
const DEFAULT_PKG = "@mrszlv/ai-ui-components";

export const PaywallCard: React.FC<PaywallCardProps> = ({
  title = "Pro component",
  message = "This component is available only with a valid license.",
  reason = 'Wrap your app with <LicenseProvider licenseKey="..." />.',
  ctaHref = DEFAULT_CTA,
  ctaLabel = "Get license",
  npmPackage = DEFAULT_PKG,
  debugReason = null,
}) => {
  const handleGetLicense = () => {
    // щоб точно працювало в будь-якому середовищі
    window.open(ctaHref, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  const installCmd = `npm i ${npmPackage}`;

  return (
    <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-b from-slate-950 to-slate-900 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/80">{message}</p>
        <p className="text-sm text-white/55">{reason}</p>

        {debugReason ? (
          <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            <span className="font-medium text-white/80">debug:</span>{" "}
            {debugReason}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGetLicense}
            className="rounded-xl bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow hover:bg-indigo-300 active:scale-[0.99]"
          >
            {ctaLabel}
          </button>

          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">
              {installCmd}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(installCmd)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/80 hover:bg-white/10"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold tracking-wide text-white/70">
            How to activate
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-white/70">
            <li>Buy/get a license key from the link above.</li>
            <li>
              Wrap your app:
              <span className="ml-2 rounded-md bg-black/40 px-2 py-1 font-mono text-xs text-white/80">
                {'<LicenseProvider licenseKey="..." />'}
              </span>
            </li>
            <li>Reload the app and the component will unlock.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
