import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatCSS } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Minimize2, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import AdSlot from "@/components/ui/ad-slot";
import { SecurityBanner } from "@/components/ui/security-banner";

const DEFAULT_CSS = `.container{display:flex;justify-content:center;align-items:center;height:100vh;background-color:#f0f0f0}.card{background-color:white;padding:20px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.button{background-color:#007bff;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer}.button:hover{background-color:#0056b3}`;

export default function CSSFormatter() {
  const [input, setInput] = useState(DEFAULT_CSS);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = (minify: boolean = false) => {
    const { formatted, error: formatError } = formatCSS(input, minify);
    setOutput(formatted);
    setError(formatError || null);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (output) {
      setOutput('');
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_CSS);
    setOutput("");
    setError(null);
  };

  useEffect(() => {
    formatCode(false); // Beautify by default
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <AdSlot position="top" id="CF-001" size="large" className="mb-6" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              CSS Formatter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format, beautify, or minify CSS code
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

      <div className="mb-6 flex gap-4">
        <Button
          onClick={() => formatCode(false)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Code className="w-4 h-4 mr-2" />
          Beautify CSS
        </Button>
        <Button
          onClick={() => formatCode(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Minify CSS
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input CSS</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your CSS here..."
              data-testid="css-input"
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
              placeholder="Formatted CSS will appear here..."
              data-testid="css-output"
              className="min-h-[400px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">CSS Formatting Options:</h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>• <strong>Beautify:</strong> Adds proper indentation, line breaks, and spacing for readability</div>
          <div>• <strong>Minify:</strong> Removes all unnecessary whitespace and comments to reduce file size</div>
          <div>• <strong>Benefits:</strong> Beautified CSS is easier to maintain, minified CSS loads faster</div>
        </div>
      </div>

      <AdSlot position="sidebar" id="CF-002" size="medium" className="mt-6" />
    </div>
  );
}