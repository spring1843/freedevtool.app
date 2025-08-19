import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolTextArea } from "@/components/ui/tool-text-area";
import { formatJSON } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Lightbulb } from "lucide-react";

import { SecurityBanner } from "@/components/ui/security-banner";
import { useState, useEffect } from "react";
import { ToolButton, ResetButton } from "@/components/ui/tool-button";

const DEFAULT_JSON = `{"name":"John Doe","age":30,"city":"New York","hobbies":["reading","swimming","coding"],"address":{"street":"123 Main St","zipCode":"10001"}}`;

export default function JsonFormatter() {
  const [input, setInput] = useState(DEFAULT_JSON);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = () => {
    const { formatted, error: formatError } = formatJSON(input);
    setOutput(formatted);
    setError(formatError || null);
  };

  const minifyCode = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch {
      setError("Invalid JSON: Unable to parse");
    }
  };

  const validateCode = () => {
    try {
      JSON.parse(input);
      setError(null);
      return true;
    } catch {
      setError("Invalid JSON: Unable to parse");
      return false;
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    // Clear output when input changes
    if (output) {
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_JSON);
    setOutput("");
    setError(null);
  };

  // Execute formatting with default value on component mount
  useEffect(() => {
    formatCode();
  }, [input]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              JSON Formatter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format, validate, and minify JSON with syntax highlighting for
              enhanced security
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

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-3">
        <ToolButton
          variant="custom"
          onClick={formatCode}
          icon={<Code className="w-4 h-4 mr-2" />}
          tooltip="Format and beautify JSON code"
        >
          Format
        </ToolButton>
        <ToolButton
          variant="custom"
          onClick={minifyCode}
          tooltip="Minify JSON to single line"
        >
          Minify
        </ToolButton>
        <ToolButton
          variant="custom"
          onClick={validateCode}
          icon={<Lightbulb className="w-4 h-4 mr-2" />}
          tooltip="Validate JSON syntax"
        >
          Validate
        </ToolButton>
        <ResetButton
          onClick={handleReset}
          tooltip="Reset to default JSON example"
        />
      </div>

      {/* Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            <ToolTextArea
              title=""
              value={input}
              onChange={handleInputChange}
              placeholder="Paste your JSON here..."
              data-testid="json-input"
              className="min-h-[400px]"
              rows={20}
              showLineNumbers={true}
              showCharacterCount={true}
              showWordCount={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted Output</CardTitle>
          </CardHeader>
          <CardContent>
            <ToolTextArea
              title=""
              value={output}
              readOnly={true}
              placeholder="Formatted JSON will appear here..."
              data-testid="json-output"
              className="min-h-[400px] bg-slate-50 dark:bg-slate-900"
              rows={20}
              showLineNumbers={true}
              showCharacterCount={true}
              showWordCount={false}
              language="json"
            />
          </CardContent>
        </Card>
      </div>

      {/* Pro Tips */}
      <div className="mt-8">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Lightbulb className="text-blue-600 dark:text-blue-400 mt-1 h-5 w-5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Pro Tips
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Use Ctrl+A to select all text quickly</li>
                  <li>
                    • The formatter will auto-detect and fix common JSON issues
                  </li>
                  <li>• Validation shows specific error locations</li>
                  <li>• Minified JSON is optimized for data transmission</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
