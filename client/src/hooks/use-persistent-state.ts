import { useState } from "react";

// Session-based state storage (clears on page refresh)
const sessionState = new Map<string, unknown>();

/**
 * Hook for persisting component state across navigation within the same session
 * @param key - Unique key for session storage
 * @param initialValue - Default value if no stored value exists
 * @returns [value, setValue] - Similar to useState but persisted in session
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get stored value from session state or use initial value
  const [storedValue, setStoredValue] = useState<T>(() =>
    sessionState.has(key) ? (sessionState.get(key) as T) : initialValue
  );

  // Save to session state whenever value changes
  const setValue = (value: T | ((prev: T) => T)) => {
    // Allow value to be a function so we have the same API as useState
    const valueToStore = value instanceof Function ? value(storedValue) : value;

    // Save state
    setStoredValue(valueToStore);

    // Save to session storage
    sessionState.set(key, valueToStore);
  };

  return [storedValue, setValue];
}

/**
 * Hook for persisting form fields within the session
 * @param toolName - Name of the tool (e.g., 'yaml-formatter')
 * @param initialFields - Object with initial field values
 * @returns Object with field values and update functions
 */
export function usePersistentForm<T extends Record<string, unknown>>(
  toolName: string,
  initialFields: T
): {
  fields: T;
  updateField: (field: keyof T, value: unknown) => void;
  updateFields: (updates: Partial<T>) => void;
  resetFields: () => void;
} {
  const [fields, setFields] = usePersistentState(
    `tool-state-${toolName}`,
    initialFields
  );

  const updateField = (field: keyof T, value: unknown) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  const updateFields = (updates: Partial<T>) => {
    setFields(prev => ({ ...prev, ...updates }));
  };

  const resetFields = () => {
    setFields(initialFields);
  };

  return {
    fields,
    updateField,
    updateFields,
    resetFields,
  };
}

/**
 * Clear stored state for a specific tool from session
 * @param toolName - Name of the tool
 */
export function clearToolState(toolName: string) {
  sessionState.delete(`tool-state-${toolName}`);
}

/**
 * Clear all tool states from session (useful for reset functionality)
 */
export function clearAllToolStates() {
  const keysToDelete = Array.from(sessionState.keys()).filter(key =>
    key.startsWith("tool-state-")
  );
  keysToDelete.forEach(key => sessionState.delete(key));
}
