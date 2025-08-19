import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatLESS } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const DEFAULT_LESS = `@primary-color: #007bff;@secondary-color: #6c757d;@border-radius: 4px;.btn{padding:10px 20px;border:none;border-radius:@border-radius;cursor:pointer;&.primary{background-color:@primary-color;color:white;&:hover{background-color:darken(@primary-color,10%);}}}&.card{background:white;border-radius:@border-radius;box-shadow:0 2px 10px rgba(0,0,0,0.1);padding:20px;.header{border-bottom:1px solid @secondary-color;padding-bottom:10px;margin-bottom:20px;h1{margin:0;color:@primary-color;}}}`;

export default function LESSFormatter() {
  const [input, setInput] = useState(DEFAULT_LESS);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = useCallback(() => {
    const { formatted, error: formatError } = formatLESS(input);
    setOutput(formatted);
    setError(formatError || null);
  }, [input]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (output) {
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_LESS);
    setOutput("");
    setError(null);
  };

  useEffect(() => {
    formatCode();
  }, [formatCode]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          LESS Formatter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Format and beautify LESS CSS preprocessor files
        </p>
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
          Format LESS
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
              placeholder="Paste your LESS code here..."
              data-testid="less-input"
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
              placeholder="Formatted LESS will appear here..."
              data-testid="less-output"
              className="min-h-[400px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
