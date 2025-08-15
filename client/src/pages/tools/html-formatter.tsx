import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatHTML } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Minimize2, RotateCcw, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import AdSlot from "@/components/ui/ad-slot";
import { SecurityBanner } from "@/components/ui/security-banner";

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page</title>
</head>
<body>
    <div class="container">
        <h1>Welcome</h1>
        <p>This is a <strong>sample</strong> HTML document with <em>various</em> elements.</p>
        <ul>
            <li>First item</li>
            <li>Second item with <a href="#link">a link</a></li>
            <li>Third item</li>
        </ul>
    </div>
    <div class="card">
        <h2>Card Title</h2>
        <p>Card content goes here.</p>
        <button type="button">Click me</button>
    </div>
</body>
</html>`;

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
}

export default function HTMLFormatter() {
  const [input, setInput] = useState(DEFAULT_HTML);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<ValidationIssue[]>([]);

  const formatCode = (minify: boolean = false) => {
    const { formatted, error: formatError, warnings: formatWarnings } = formatHTML(input, minify);
    setOutput(formatted);
    setError(formatError || null);
    setWarnings(formatWarnings || []);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (output) {
      setOutput('');
      setWarnings([]);
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_HTML);
    setOutput("");
    setError(null);
    setWarnings([]);
  };

  useEffect(() => {
    formatCode(false); // Beautify by default
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <AdSlot position="top" id="HF-001" size="large" className="mb-6" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              HTML Formatter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format, beautify, or minify HTML code with validation
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="font-semibold mb-2">HTML Validation Issues:</div>
            <div className="space-y-1 text-sm">
              {warnings.slice(0, 5).map((warning, index) => (
                <div key={index}>
                  <span className={`font-medium ${warning.type === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {warning.type === 'error' ? 'Error' : 'Warning'}
                  </span>
                  {warning.line && <span className="text-gray-500"> (Line {warning.line})</span>}: {warning.message}
                </div>
              ))}
              {warnings.length > 5 && (
                <div className="text-gray-600">... and {warnings.length - 5} more issues</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex gap-4">
        <Button
          onClick={() => formatCode(false)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Code className="w-4 h-4 mr-2" />
          Beautify HTML
        </Button>
        <Button
          onClick={() => formatCode(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Minify HTML
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input HTML</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your HTML here..."
              data-testid="html-input"
              className="min-h-[400px] font-mono text-sm"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Formatted Output
              {warnings.length > 0 && (
                <span className="flex items-center text-yellow-600 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {warnings.length} issues
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly={true}
              placeholder="Formatted HTML will appear here..."
              data-testid="html-output"
              className="min-h-[400px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">HTML Formatting Options:</h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <div>• <strong>Beautify:</strong> Adds proper indentation and line breaks for readability</div>
            <div>• <strong>Minify:</strong> Removes whitespace and comments to reduce file size</div>
            <div>• <strong>Validation:</strong> Checks for common HTML issues and best practices</div>
          </div>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Validation Features:</h3>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <div>• Checks for unclosed or mismatched tags</div>
            <div>• Validates required attributes (alt, src, etc.)</div>
            <div>• Detects accessibility and SEO issues</div>
            <div>• Suggests best practice improvements</div>
          </div>
        </div>
      </div>

      <AdSlot position="sidebar" id="HF-002" size="medium" className="mt-6" />
    </div>
  );
}