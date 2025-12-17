import React from "react";
import AIUI from "@ai-ui/components";

export const ChatDemo: React.FC = () => {
  return (
    <AIUI.LicenseProvider licenseKey="mrszlv_demo_public_1">
      <AIUI.AIProvider>
        <AIUI.ChatBox />
      </AIUI.AIProvider>
    </AIUI.LicenseProvider>
  );
};
