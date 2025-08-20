import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatCSS, formatLESS, formatSCSS } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code, Minimize2, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

import { SecurityBanner } from "@/components/ui/security-banner";

const DEFAULT_CSS = `.container{display:flex;justify-content:center;align-items:center;height:100vh;background-color:#f0f0f0}.card{background-color:white;padding:20px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.button{background-color:#007bff;color:white;border:none;padding:10px 20px;border-radius:4px;cursor:pointer}.button:hover{background-color:#0056b3}`;

const DEFAULT_SCSS = `$primary-color:#007bff;$secondary-color:#6c757d;$border-radius:4px;.container{display:flex;justify-content:center;align-items:center;height:100vh;background-color:#f0f0f0;.card{background-color:white;padding:20px;border-radius:$border-radius;box-shadow:0 2px 10px rgba(0,0,0,0.1);.button{background-color:$primary-color;color:white;border:none;padding:10px 20px;border-radius:$border-radius;cursor:pointer;&:hover{background-color:darken($primary-color,10%);}}}}`;

const DEFAULT_LESS = `@primary-color:#007bff;@secondary-color:#6c757d;@border-radius:4px;.container{display:flex;justify-content:center;align-items:center;height:100vh;background-color:#f0f0f0;.card{background-color:white;padding:20px;border-radius:@border-radius;box-shadow:0 2px 10px rgba(0,0,0,0.1);.button{background-color:@primary-color;color:white;border:none;padding:10px 20px;border-radius:@border-radius;cursor:pointer;&:hover{background-color:darken(@primary-color,10%);}}}}`;

type FormatType = "css" | "scss" | "less";

export default function CSSFormatter() {
  const [location] = useLocation();

  // Determine initial format based on route
  const getInitialFormat = (): FormatType => {
    if (location.includes("/tools/scss-formatter")) return "scss";
    if (location.includes("/tools/less-formatter")) return "less";
    return "css";
  };

  const [format, setFormat] = useState<FormatType>(getInitialFormat());
  const [input, setInput] = useState(() => {
    const initialFormat = getInitialFormat();
    switch (initialFormat) {
      case "scss":
        return DEFAULT_SCSS;
      case "less":
        return DEFAULT_LESS;
      default:
        return DEFAULT_CSS;
    }
  });
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = useCallback(
    async (minify = false) => {
      try {
        let formatter = formatCSS;

        switch (format) {
          case "scss":
            formatter = formatSCSS;
            break;
          case "less":
            formatter = formatLESS;
            break;
          default:
            formatter = formatCSS;
        }

        const { formatted, error: formatError } = await formatter(
          input,
          minify
        );
        setOutput(formatted);
        setError(formatError || null);
      } catch (error) {
        setError(
          `Formatting error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    },
    [input, format]
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    if (output) {
      setOutput("");
    }
  };

  const handleFormatChange = (newFormat: FormatType) => {
    setFormat(newFormat);
    setOutput("");
    setError(null);

    // Change default input based on format
    switch (newFormat) {
      case "scss":
        setInput(DEFAULT_SCSS);
        break;
      case "less":
        setInput(DEFAULT_LESS);
        break;
      default:
        setInput(DEFAULT_CSS);
    }
  };

  const handleReset = () => {
    switch (format) {
      case "scss":
        setInput(DEFAULT_SCSS);
        break;
      case "less":
        setInput(DEFAULT_LESS);
        break;
      default:
        setInput(DEFAULT_CSS);
    }
    setOutput("");
    setError(null);
  };

  // Update format when route changes
  useEffect(() => {
    const newFormat = getInitialFormat();
    if (newFormat !== format) {
      setFormat(newFormat);
      switch (newFormat) {
        case "scss":
          setInput(DEFAULT_SCSS);
          break;
        case "less":
          setInput(DEFAULT_LESS);
          break;
        default:
          setInput(DEFAULT_CSS);
      }
      setOutput("");
      setError(null);
    }
  }, [location, format]);

  useEffect(() => {
    formatCode(false); // Beautify by default
  }, [formatCode]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              CSS/LESS/SCSS Formatter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format, beautify, or minify CSS, LESS, and SCSS stylesheets using
              Prettier
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

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Format:
          </label>
          <Select value={format} onValueChange={handleFormatChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="scss">SCSS</SelectItem>
              <SelectItem value="less">LESS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => formatCode(false)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Code className="w-4 h-4 mr-2" />
            Beautify Code
          </Button>
          <Button
            onClick={() => formatCode(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Minimize2 className="w-4 h-4 mr-2" />
            Minify Code
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input CSS/LESS/SCSS</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="Paste your CSS, LESS, or SCSS code here..."
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
              placeholder="Formatted CSS/LESS/SCSS will appear here..."
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
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          CSS/LESS/SCSS Formatting Options:
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>
            • <strong>Format Selector:</strong> Choose CSS, SCSS, or LESS to use
            the appropriate parser and formatting rules
          </div>
          <div>
            • <strong>Beautify:</strong> Adds proper indentation, line breaks,
            and spacing for readability
          </div>
          <div>
            • <strong>Minify:</strong> Removes all unnecessary whitespace and
            comments to reduce file size
          </div>
          <div>
            • <strong>Benefits:</strong> Beautified CSS is easier to maintain,
            minified CSS loads faster
          </div>
        </div>
      </div>
    </div>
  );
}
