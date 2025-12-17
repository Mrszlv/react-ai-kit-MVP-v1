import React from "react";
import AIUI from "@ai-ui/components";

export const RewriterDemo: React.FC = () => {
  return (
    <AIUI.LicenseProvider licenseKey="mrszlv_demo_public_1">
      <AIUI.AIProvider>
        <AIUI.Rewriter />
      </AIUI.AIProvider>
    </AIUI.LicenseProvider>
  );
};
