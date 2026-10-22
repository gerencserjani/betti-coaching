import type { ReactElement, ReactNode } from "react";
import { CoachConfigContext, type CoachConfig } from "./CoachConfig.ts";

export default function CoachConfigProvider({
  config,
  children,
}: {
  config: CoachConfig;
  children: ReactNode;
}): ReactElement {
  return (
    <CoachConfigContext.Provider value={config}>
      {children}
    </CoachConfigContext.Provider>
  );
}
