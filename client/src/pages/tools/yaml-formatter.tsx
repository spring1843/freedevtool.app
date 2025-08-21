import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatYAML } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { SecurityBanner } from "@/components/ui/security-banner";

const DEFAULT_YAML = `name: John Doe
age: 30
email: john@example.com
address:
  street: 123 Main St
  city: New York
  zipCode: "10001"
  country: USA
hobbies:
  - reading
  - swimming
  - coding
  - traveling
skills:
  - name: JavaScript
    level: expert
    years: 5
  - name: Python
    level: intermediate
    years: 3
  - name: Docker
    level: beginner
    years: 1
isActive: true
preferences:
  theme: dark
  notifications: true
  language: en`;

export default function YAMLFormatter() {
  const [input, setInput] = useState(DEFAULT_YAML);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = useCallback(async () => {
    try {
      const { formatted, error: formatError } = await formatYAML(input);
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
    setInput(DEFAULT_YAML);
    setOutput("");
    setError(null);
  };

  useEffect(() => {
    formatCode();
  }, [formatCode]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              YAML Formatter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format and beautify YAML configuration files
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

      <div className="mb-6 flex gap-4">
        <Button
          onClick={formatCode}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Code className="w-4 h-4 mr-2" />
          Format YAML
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="Paste your YAML here..."
              data-testid="yaml-input"
              className="min-h-[400px] font-mono text-sm"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted Output</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly={true}
              placeholder="Formatted YAML will appear here..."
              data-testid="yaml-output"
              className="min-h-[400px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          YAML Features:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Human-readable data serialization standard</li>
          <li>
            • Supports complex data structures like lists and dictionaries
          </li>
          <li>• Commonly used for configuration files and data exchange</li>
          <li>• Strict indentation rules using spaces (not tabs)</li>
        </ul>
      </div>
    </div>
  );
}
