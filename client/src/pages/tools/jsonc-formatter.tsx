import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatJSONC } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";

import { DEFAULT_JSONC } from "@/data/defaults";

export default function JSONCFormatter() {
  const [input, setInput] = useState(DEFAULT_JSONC);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = useCallback(async () => {
    try {
      const { formatted, error: formatError } = await formatJSONC(input);
      setOutput(formatted);
      setError(formatError || null);
    } catch (error) {
      setError(
        `Formatting error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }, [input]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (output) {
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_JSONC);
    setOutput("");
    setError(null);
  };

  useEffect(() => {
    document.title = "JSONC Formatter - FreeDevTool.App";
    formatCode();
  }, [formatCode]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              JSONC Formatter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format JSON with Comments (JSONC) files while preserving comments
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      {error ? (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Input JSONC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              data-testid="jsonc-input"
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="Paste your JSONC code here..."
              className="font-mono text-sm min-h-[400px] resize-y"
              spellCheck={false}
            />
            <div className="flex gap-2 flex-wrap">
              <Button onClick={formatCode} className="flex-1 sm:flex-none">
                Format JSONC
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Formatted Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              data-testid="jsonc-output"
              value={output}
              readOnly
              placeholder="Formatted JSONC will appear here..."
              className="font-mono text-sm min-h-[400px] resize-y bg-slate-50 dark:bg-slate-900"
            />
            <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              <p>
                JSONC (JSON with Comments) allows single-line (//) and
                multi-line (/* */) comments in JSON files.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About JSONC Format</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <p>
            <strong>JSONC (JSON with Comments)</strong> is an extension of JSON
            that allows comments:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              <strong>Single-line comments:</strong> {`// This is a comment`}
            </li>
            <li>
              <strong>Multi-line comments:</strong>{" "}
              {`/* This is a multi-line comment */`}
            </li>
            <li>
              <strong>Use cases:</strong> Configuration files, VS Code settings,
              TypeScript configs
            </li>
            <li>
              <strong>Popular tools:</strong> VS Code, TypeScript, Azure DevOps,
              and more
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
