import React from "react";
import AIUI from "@ai-ui/components";

export const TranslatorDemo: React.FC = () => {
  return (
    <AIUI.LicenseProvider licenseKey="mrszlv_demo_public_1">
      <AIUI.AIProvider>
        <AIUI.Translator />
      </AIUI.AIProvider>
    </AIUI.LicenseProvider>
  );
};
