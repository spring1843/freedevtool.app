import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { useLocation } from "wouter";
import { getDemoTools } from "@/data/tools";

type DemoSpeed = "slow" | "normal" | "fast" | "very-fast" | "crazy-fast";

interface DemoContextType {
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

const DemoContext = createContext<DemoContextType | undefined>(undefined);

interface DemoProviderProps {
  children: React.ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [, setLocation] = useLocation();
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [isDemoPaused, setIsDemoPaused] = useState(false);
  const [currentDemoTool, setCurrentDemoTool] = useState<string>("");
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoSpeed, setDemoSpeedState] = useState<DemoSpeed>(() => {
    // Load speed preference from localStorage
    const saved = localStorage.getItem("freedevtool-demo-speed");
    return (saved as DemoSpeed) || "normal";
  });
  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const pauseStartTimeRef = useRef<number | null>(null);
  const remainingTimeRef = useRef<number>(0);
  const demoSpeedRef = useRef<DemoSpeed>(demoSpeed);

  // Speed configurations in milliseconds
  const speedConfig: Record<DemoSpeed, number> = {
    slow: 8000, // 8 seconds
    normal: 5000, // 5 seconds
    fast: 3000, // 3 seconds
    "very-fast": 1500, // 1.5 seconds
    "crazy-fast": 100, // 100 milliseconds
  };

  // Wrapper function to save speed to localStorage and restart current cycle with new speed
  const setDemoSpeed = (speed: DemoSpeed) => {
    setDemoSpeedState(speed);
    demoSpeedRef.current = speed; // Update ref immediately
    localStorage.setItem("freedevtool-demo-speed", speed);

    // If demo is running and not paused, restart the current cycle with new speed
    if (isDemoRunning && !isDemoPaused && demoTimeoutRef.current) {
      // Clear current timeout
      clearTimeout(demoTimeoutRef.current);

      // Restart current tool with new speed (skip to next immediately)
      cycleThroughTools(currentIndexRef.current + 1);
    }
  };

  // Keep ref in sync with state
  useEffect(() => {
    demoSpeedRef.current = demoSpeed;
  }, [demoSpeed]);

  // Get all tools in a flat array for demo using centralized function
  const allTools = getDemoTools();

  const cycleThroughTools = (index: number, customDelay?: number) => {
    if (index >= allTools.length) {
      // Demo complete
      stopDemo();
      return;
    }

    const tool = allTools[index];
    setCurrentDemoTool(tool.name);
    setDemoProgress(((index + 1) / allTools.length) * 100);
    currentIndexRef.current = index;

    // Navigate to the tool
    setLocation(tool.path);

    // Set up next tool after configured delay - use ref to get current speed
    const delay =
      customDelay !== undefined
        ? customDelay
        : speedConfig[demoSpeedRef.current];
    remainingTimeRef.current = delay;
    pauseStartTimeRef.current = Date.now();

    demoTimeoutRef.current = setTimeout(() => {
      cycleThroughTools(index + 1);
    }, delay);
  };

  const startDemo = () => {
    setIsDemoRunning(true);
    setIsDemoPaused(false);
    setDemoProgress(0);
    currentIndexRef.current = 0;
    cycleThroughTools(0);
  };

  const stopDemo = () => {
    setIsDemoRunning(false);
    setIsDemoPaused(false);
    setCurrentDemoTool("");
    setDemoProgress(0);
    currentIndexRef.current = 0;
    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
    }
    setLocation("/"); // Return to homepage
  };

  const pauseDemo = () => {
    if (!isDemoRunning || isDemoPaused) return;

    setIsDemoPaused(true);

    // Calculate remaining time
    const elapsed = pauseStartTimeRef.current
      ? Date.now() - pauseStartTimeRef.current
      : 0;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);

    // Clear current timeout
    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
      demoTimeoutRef.current = null;
    }
  };

  const resumeDemo = () => {
    if (!isDemoRunning || !isDemoPaused) return;

    setIsDemoPaused(false);
    pauseStartTimeRef.current = Date.now();

    // Resume with remaining time
    demoTimeoutRef.current = setTimeout(() => {
      cycleThroughTools(currentIndexRef.current + 1);
    }, remainingTimeRef.current);
  };

  const skipToNext = () => {
    if (!isDemoRunning) return;

    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
    }
    setIsDemoPaused(false);
    cycleThroughTools(currentIndexRef.current + 1);
  };

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (demoTimeoutRef.current) {
        clearTimeout(demoTimeoutRef.current);
      }
    },
    []
  );

  const value: DemoContextType = {
    isDemoRunning,
    isDemoPaused,
    currentDemoTool,
    demoProgress,
    demoSpeed,
    startDemo,
    stopDemo,
    pauseDemo,
    resumeDemo,
    skipToNext,
    setDemoSpeed,
    totalTools: allTools.length,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
