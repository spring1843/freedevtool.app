import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatMarkdown } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";
import { toolDefaults } from "@/data/defaults";

export default function MarkdownFormatter() {
  const [input, setInput] = useState(toolDefaults.markdown);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = useCallback(async () => {
    try {
      const { formatted, error: formatError } = await formatMarkdown(input);
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
    setInput(toolDefaults.markdown);
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
              Markdown Formatter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format and beautify Markdown documents
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
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <FileText className="w-4 h-4 mr-2" />
          Format Markdown
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
              placeholder="Paste your Markdown here..."
              data-testid="markdown-input"
              className="min-h-[500px] font-mono text-sm"
              rows={25}
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
              placeholder="Formatted Markdown will appear here..."
              data-testid="markdown-output"
              className="min-h-[500px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={25}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Markdown Syntax:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
          <div>
            <div>
              <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
                # Header 1
              </span>
            </div>
            <div>
              <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
                ## Header 2
              </span>
            </div>
            <div>
              <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
                **bold**
              </span>
            </div>
            <div>
              <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
                *italic*
              </span>
            </div>
          </div>
          <div>
            <div>
              <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
                - List item
              </span>
            </div>
            <div>
              <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
                1. Numbered
              </span>
            </div>
            <div>
              <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
                [Link](url)
              </span>
            </div>
            <div>
              <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
                `code`
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
