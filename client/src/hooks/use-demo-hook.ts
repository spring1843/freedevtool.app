import { useContext } from "react";
import { DemoContext } from "@/contexts/demo-context";

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
