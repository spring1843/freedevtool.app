import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { formatCSS } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import AdSlot from "@/components/ui/ad-slot";

const DEFAULT_CSS = `.container{display:flex;justify-content:center;align-items:center;height:100vh;background-color:#f0f0f0}.card{background-color:white;padding:20px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.button{background-color:#007bff;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer}.button:hover{background-color:#0056b3}`;

export default function CSSFormatter() {
  const [input, setInput] = useState(DEFAULT_CSS);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = () => {
    const { formatted, error: formatError } = formatCSS(input);
    setOutput(formatted);
    setError(formatError || null);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    // Clear output when input changes
    if (output) {
      setOutput('');
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_CSS);
    setOutput("");
    setError(null);
  };

  // Execute CSS formatting with default value on component mount
  useEffect(() => {
    formatCode();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="CF-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          CSS Formatter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Format and beautify CSS with proper indentation and spacing
        </p>
      </div>

      {error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert> : null}

      {/* Controls */}
      <div className="mb-6 flex gap-4">
        <Button
          onClick={formatCode}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Code className="w-4 h-4 mr-2" />
          Format CSS
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

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
              placeholder="Paste your CSS here..."
              data-testid="css-input"
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
              placeholder="Formatted CSS will appear here..."
              data-testid="css-output"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Side Ad */}
      <AdSlot position="sidebar" id="CF-002" size="medium" className="mt-6" />
    </div>
  );
}