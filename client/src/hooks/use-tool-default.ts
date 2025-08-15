import { useEffect, useRef } from 'react';

/**
 * Hook to execute a function once when the component mounts with default values
 * This ensures that tools with default data show processed results immediately
 */
export function useToolDefault(executeFunction: () => void, dependencies: unknown[] = []) {
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (!hasExecuted.current) {
      executeFunction();
      hasExecuted.current = true;
    }
  }, [executeFunction]);

  // Also execute when dependencies change (but not on first mount since we already did)
  useEffect(() => {
    if (hasExecuted.current && dependencies.length > 0) {
      executeFunction();
    }
  }, [executeFunction, dependencies.length, ...dependencies]);
}