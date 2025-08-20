import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatSCSS } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Minimize2, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";

const DEFAULT_SCSS = `$primary-color:#3498db;$secondary-color:#2ecc71;$font-size-base:16px;$font-family:'Roboto',sans-serif;@mixin button-style($bg-color,$text-color:#fff){background-color:$bg-color;color:$text-color;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-family:$font-family;&:hover{background-color:darken($bg-color,10%);}&:active{transform:translateY(1px);}}%card-base{background:white;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);padding:20px;}%flex-center{display:flex;justify-content:center;align-items:center;}.container{max-width:1200px;margin:0 auto;padding:0 20px;.header{@extend %flex-center;height:80px;background-color:$primary-color;h1{color:white;font-size:$font-size-base*2;margin:0;}}.main-content{display:grid;grid-template-columns:1fr 3fr;gap:20px;margin-top:20px;.sidebar{@extend %card-base;ul{list-style:none;padding:0;li{padding:10px 0;border-bottom:1px solid #eee;&:last-child{border-bottom:none;}a{text-decoration:none;color:$primary-color;&:hover{color:darken($primary-color,15%);}}}}}.content{@extend %card-base;h2{color:$secondary-color;margin-bottom:20px;}p{line-height:1.6;margin-bottom:15px;}.btn{@include button-style($primary-color);&.secondary{@include button-style($secondary-color);}}}}@media(max-width:768px){.container .main-content{grid-template-columns:1fr;.sidebar{order:2;}}}}`;

export default function SCSSFormatter() {
  const [input, setInput] = useState(DEFAULT_SCSS);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCode = useCallback(
    async (minify = false) => {
      try {
        const { formatted, error: formatError } = await formatSCSS(
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
    [input]
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    if (output) {
      setOutput("");
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_SCSS);
    setOutput("");
    setError(null);
  };

  useEffect(() => {
    formatCode(false); // Beautify by default
  }, [formatCode]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              SCSS Formatter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Format, beautify, or minify SCSS/Sass code using Prettier
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
          onClick={() => formatCode(false)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Code className="w-4 h-4 mr-2" />
          Beautify SCSS
        </Button>
        <Button
          onClick={() => formatCode(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          Minify SCSS
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input SCSS</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="Paste your SCSS code here..."
              data-testid="scss-input"
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
              placeholder="Formatted SCSS will appear here..."
              data-testid="scss-output"
              className="min-h-[400px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-slate-700 dark:text-slate-300">
              <Code className="w-5 h-5 mr-2" />
              SCSS Formatting Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                  SCSS Features Supported:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Variable declarations ($variable)</li>
                  <li>• Nested selectors and rules</li>
                  <li>• Mixins (@mixin) and includes (@include)</li>
                  <li>• Extends and placeholders (%placeholder)</li>
                  <li>• Functions and control directives</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Formatting Benefits:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Consistent indentation and spacing</li>
                  <li>• Proper nesting structure</li>
                  <li>• Optimized for compilation</li>
                  <li>• Maintains SCSS syntax integrity</li>
                  <li>• Professional code organization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
