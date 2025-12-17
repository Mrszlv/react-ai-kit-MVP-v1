import React from "react";
import AIUI from "@ai-ui/components";

export const SummarizerDemo: React.FC = () => {
  return (
    <AIUI.LicenseProvider licenseKey="mrszlv_demo_public_1">
      <AIUI.AIProvider>
        <AIUI.Summarizer />
      </AIUI.AIProvider>
    </AIUI.LicenseProvider>
  );
};
