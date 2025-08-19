import { useEffect, useRef, useMemo } from "react";

/**
 * Hook to execute a function once when the component mounts with default values
 * This ensures that tools with default data show processed results immediately
 */
export function useToolDefault(
  executeFunction: () => void,
  dependencies: unknown[] = []
) {
  const hasExecuted = useRef(false);

  // Create a stable reference for dependencies to track changes
  const dependencyString = useMemo(
    () => JSON.stringify(dependencies),
    [dependencies]
  );

  useEffect(() => {
    if (!hasExecuted.current) {
      executeFunction();
      hasExecuted.current = true;
    }
  }, [executeFunction]);

  // Execute when dependencies change (but not on first mount since we already did)
  useEffect(() => {
    if (hasExecuted.current && dependencies.length > 0) {
      executeFunction();
    }
  }, [executeFunction, dependencyString, dependencies.length]);
}
