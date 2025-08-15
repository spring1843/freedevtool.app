import { useState } from "react";

interface FormatterHook {
  input: string;
  output: string;
  error: string | null;
  setInput: (value: string) => void;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  format: (formatFn: (input: string) => { formatted: string; error?: string }) => void;
  reset: () => void;
}

export function useFormatter(initialInput = ""): FormatterHook {
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const format = (formatFn: (input: string) => { formatted: string; error?: string }) => {
    const result = formatFn(input);
    setOutput(result.formatted);
    setError(result.error || null);
  };

  const reset = () => {
    setOutput("");
    setError(null);
  };

  return {
    input,
    output,
    error,
    setInput,
    setOutput,
    setError,
    format,
    reset
  };
}