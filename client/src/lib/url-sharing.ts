/**
 * URL sharing utilities for preserving tool state in URLs
 * Includes validation and sanitization to prevent malicious input
 */

export interface URLShareParams {
  [key: string]: string | number | boolean;
}

export interface ValidationRule {
  type: "string" | "number" | "boolean" | "enum" | "array";
  min?: number;
  max?: number;
  maxLength?: number;
  allowedValues?: string[];
  pattern?: RegExp;
  arrayMaxLength?: number;
  arrayItemPattern?: RegExp;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Get URL parameters as an object
 */
export function getURLParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/**
 * Update URL with new parameters without page refresh
 */
export function updateURL(params: URLShareParams, replaceState = true): void {
  const urlParams = new URLSearchParams(window.location.search);

  // Update parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      urlParams.set(key, String(value));
    } else {
      urlParams.delete(key);
    }
  });

  const newURL = `${window.location.pathname}?${urlParams.toString()}`;

  if (replaceState) {
    window.history.replaceState(null, "", newURL);
  } else {
    window.history.pushState(null, "", newURL);
  }
}

/**
 * Sanitize and validate a string value
 */
function sanitizeString(value: string, maxLength = 1000): string {
  // Remove potentially dangerous characters and limit length
  return value
    .replace(/[<>'"&{}]/g, "") // Remove HTML/JS injection chars
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/data:/gi, "") // Remove data: protocol
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .trim()
    .substring(0, maxLength);
}

/**
 * Validate a parameter value against a validation rule
 */
function validateParam(
  value: unknown,
  rule: ValidationRule,
  defaultValue: unknown
): unknown {
  try {
    switch (rule.type) {
      case "string":
        if (typeof value !== "string") return defaultValue;
        {
          const sanitized = sanitizeString(value, rule.maxLength);
          if (rule.pattern && !rule.pattern.test(sanitized))
            return defaultValue;
          if (rule.allowedValues && !rule.allowedValues.includes(sanitized))
            return defaultValue;
          return sanitized;
        }

      case "number": {
        const num = Number(value);
        if (isNaN(num)) return defaultValue;
        if (rule.min !== undefined && num < rule.min) return defaultValue;
        if (rule.max !== undefined && num > rule.max) return defaultValue;
        return num;
      }

      case "boolean": {
        if (typeof value === "boolean") return value;
        if (typeof value === "string") return value === "true";
        return defaultValue;
      }

      case "enum": {
        if (rule.allowedValues && rule.allowedValues.includes(String(value))) {
          return String(value);
        }
        return defaultValue;
      }

      case "array": {
        if (typeof value !== "string") return defaultValue;
        const items = value
          .split(",")
          .map(item => sanitizeString(item.trim(), 100))
          .filter(item => item.length > 0);

        if (rule.arrayMaxLength && items.length > rule.arrayMaxLength) {
          return defaultValue;
        }

        if (rule.arrayItemPattern) {
          const validItems = items.filter(item =>
            rule.arrayItemPattern!.test(item)
          );
          if (validItems.length !== items.length) return defaultValue;
        }

        if (rule.allowedValues) {
          const validItems = items.filter(item =>
            rule.allowedValues!.includes(item)
          );
          if (validItems.length !== items.length) return defaultValue;
          return validItems;
        }

        return items;
      }

      default:
        return defaultValue;
    }
  } catch {
    return defaultValue;
  }
}

/**
 * Get a parameter value with type conversion and validation
 */
export function getParam(
  key: string,
  defaultValue?: string
): string | undefined;
export function getParam(key: string, defaultValue: number): number;
export function getParam(key: string, defaultValue: boolean): boolean;
export function getParam(key: string, defaultValue?: unknown): unknown {
  const params = getURLParams();
  const value = params.get(key);

  if (value === null) {
    return defaultValue;
  }

  // Type conversion based on default value type with basic validation
  if (typeof defaultValue === "number") {
    const num = Number(value);
    // Prevent extreme numbers that could cause issues
    if (isNaN(num) || num < -1e10 || num > 1e10) return defaultValue;
    return num;
  }

  if (typeof defaultValue === "boolean") {
    return value === "true";
  }

  // Sanitize string values
  if (typeof value === "string") {
    return sanitizeString(value);
  }

  return value || defaultValue;
}

/**
 * Get a parameter value with strict validation using a schema
 */
export function getValidatedParam(
  key: string,
  defaultValue: unknown,
  validationRule: ValidationRule
): unknown {
  const params = getURLParams();
  const value = params.get(key);

  if (value === null) {
    return defaultValue;
  }

  return validateParam(value, validationRule, defaultValue);
}

/**
 * Generate a shareable URL for the current tool with parameters
 */
export function generateShareableURL(params: URLShareParams): string {
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      urlParams.set(key, String(value));
    }
  });

  return `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
}

/**
 * Copy shareable URL to clipboard
 */
export async function copyShareableURL(
  params: URLShareParams
): Promise<boolean> {
  try {
    const url = generateShareableURL(params);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error("Failed to copy URL to clipboard:", error);
    return false;
  }
}

/**
 * Parse array parameters from URL (comma-separated values) - DEPRECATED
 * Use getValidatedParam with type: 'array' instead for security
 */
export function getArrayParam(
  key: string,
  defaultValue: string[] = []
): string[] {
  const value = getParam(key, "");
  if (!value) return defaultValue;
  return value.split(",").filter(Boolean);
}

/**
 * Create a validation schema for common tool parameter types
 */
export const commonValidationSchemas = {
  // Numeric inputs with reasonable ranges
  percentage: { type: "number" as const, min: 0, max: 100 },
  smallNumber: { type: "number" as const, min: 0, max: 999999 },
  largeNumber: { type: "number" as const, min: 0, max: 1000000000 },
  year: { type: "number" as const, min: 1900, max: 2200 },

  // String inputs with patterns
  alphanumeric: {
    type: "string" as const,
    pattern: /^[a-zA-Z0-9]*$/,
    maxLength: 100,
  },
  safePath: {
    type: "string" as const,
    pattern: /^[a-zA-Z0-9/_-]*$/,
    maxLength: 200,
  },
  dateString: {
    type: "string" as const,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    maxLength: 10,
  },
  timeString: {
    type: "string" as const,
    pattern: /^\d{2}:\d{2}(:\d{2})?$/,
    maxLength: 8,
  },

  // Common enums
  frequency: {
    type: "enum" as const,
    allowedValues: ["daily", "weekly", "monthly", "yearly"],
  },
  booleanString: { type: "enum" as const, allowedValues: ["true", "false"] },
};

/**
 * Set array parameter in URL (comma-separated values)
 */
export function setArrayParam(key: string, values: string[]): void {
  updateURL({ [key]: values.join(",") });
}

/**
 * Clear all URL parameters
 */
export function clearURLParams(): void {
  window.history.replaceState(null, "", window.location.pathname);
}
