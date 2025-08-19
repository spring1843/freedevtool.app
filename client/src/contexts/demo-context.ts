import { createContext } from "react";

export type DemoSpeed = "slow" | "normal" | "fast" | "very-fast" | "crazy-fast";

export interface DemoContextType {
  isDemoRunning: boolean;
  isDemoPaused: boolean;
  currentDemoTool: string;
  demoProgress: number;
  demoSpeed: DemoSpeed;
  startDemo: () => void;
  stopDemo: () => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  skipToNext: () => void;
  setDemoSpeed: (speed: DemoSpeed) => void;
  totalTools: number;
}

export const DemoContext = createContext<DemoContextType | undefined>(undefined);