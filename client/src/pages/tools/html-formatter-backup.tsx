import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { formatHTML } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import AdSlot from "@/components/ui/ad-slot";
import { SecurityBanner } from "@/components/ui/security-banner";

const DEFAULT_HTML = `<!DOCTYPE html><html><head><title>Example</title></head><body><div class="container"><h1>Hello World</h1><p>This is a paragraph with <a href="#link">a link</a> and <strong>bold text</strong>.</p><ul><li>Item 1</li><li>Item 2</li></ul></div></body></html>`;

export default function HTMLFormatter() {
  const [input, setInput] = useState(DEFAULT_HTML);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<any[]>([]);
  const [isValid, setIsValid] = useState(true);

  const formatCode = () => {
    const { formatted, error: formatError, warnings } = formatHTML(input);
    setOutput(formatted);
    setError(formatError || null);
    setValidationIssues(warnings || []);
    setIsValid(!formatError && (!warnings || warnings.length === 0));
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    // Clear output when input changes
    if (output) {
      setOutput('');
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_HTML);
    setOutput("");
    setError(null);
    setValidationIssues([]);
    setIsValid(true);
  };

  // Execute HTML formatting with default value on component mount
  useEffect(() => {
    formatCode();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="HF-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              HTML Beautifier
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format, beautify, and validate HTML with comprehensive error checking - completely secure and offline
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      {error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert> : null}

      {/* Validation Status */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center">
          {isValid ? (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Valid HTML
            </div>
          ) : (
            <div className="flex items-center text-red-600 text-sm">
              <XCircle className="w-4 h-4 mr-1" />
              {validationIssues.length} Issues Found
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-4">
        <Button
          onClick={formatCode}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Code className="w-4 h-4 mr-2" />
          Format HTML
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="font-semibold mb-2">Validation Issues:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationIssues.slice(0, 5).map((issue, index) => (
                <li key={index} className="text-sm">
                  {issue.line && `Line ${issue.line}: `}{issue.message}
                </li>
              ))}
              {validationIssues.length > 5 && (
                <li className="text-sm italic">
                  ... and {validationIssues.length - 5} more issues
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={input}
              onChange={handleInputChange}
              placeholder="Paste your HTML here..."
              data-testid="html-input"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted Output</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={output}
              onChange={() => {}}
              disabled={true}
              placeholder="Formatted HTML will appear here..."
              data-testid="html-output"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Side Ad */}
      <AdSlot position="sidebar" id="HF-002" size="medium" className="mt-6" />
    </div>
  );
}