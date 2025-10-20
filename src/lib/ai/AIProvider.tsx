import React, { useMemo } from "react";
import { AIContext, type AIConfig } from "./AIContext";

export const AIProvider: React.FC<React.PropsWithChildren<AIConfig>> = ({
  client,
  defaultModel,
  children,
}) => {
  const value = useMemo(
    () => ({ client, defaultModel }),
    [client, defaultModel]
  );
  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};
