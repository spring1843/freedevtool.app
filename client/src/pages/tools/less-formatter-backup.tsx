import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { formatLESS } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, RotateCcw } from "lucide-react";
import { usePersistentForm } from "@/hooks/use-persistent-state";

const DEFAULT_LESS = `@primary-color: #007bff;@padding: 20px;@border-radius: 8px;.container{display:flex;justify-content:center;align-items:center;height:100vh;background-color:lighten(@primary-color, 40%);.card{background-color:white;padding:@padding;border-radius:@border-radius;box-shadow:0 2px 10px rgba(0,0,0,0.1);.button{background-color:@primary-color;color:white;border:none;padding:(@padding / 2) @padding;border-radius:(@border-radius / 2);cursor:pointer;&:hover{background-color:darken(@primary-color, 10%)}}}}`;

export default function LessFormatter() {
  const { fields, updateField, resetFields } = usePersistentForm('less-formatter', {
    input: DEFAULT_LESS,
    output: "",
    error: null as string | null
  });

  const { input, output, error } = fields;

  const formatCode = () => {
    const { formatted, error: formatError } = formatLESS(input);
    updateField('output', formatted);
    updateField('error', formatError || null);
  };

  const handleInputChange = (value: string) => {
    updateField('input', value);
    if (output) {
      updateField('output', '');
      updateField('error', null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          LESS Formatter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Format and beautify LESS with proper indentation and spacing
        </p>
      </div>

      {error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert> : null}

      {/* Controls */}
      <div className="mb-6 flex gap-2">
        <Button onClick={formatCode} data-testid="format-less-button">
          <Code className="w-4 h-4 mr-2" />
          Format LESS
        </Button>
        <Button onClick={resetFields} variant="outline" data-testid="reset-less-button">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>LESS Input</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={input}
              onChange={handleInputChange}
              placeholder="Paste your LESS here..."
              data-testid="less-input"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted LESS</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={output}
              onChange={() => {}}
              disabled={true}
              placeholder="Formatted LESS will appear here..."
              data-testid="less-output"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
