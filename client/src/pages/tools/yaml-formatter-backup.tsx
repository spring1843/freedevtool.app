import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { formatYAML } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code } from "lucide-react";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import { useToolDefault } from "@/hooks/use-tool-default";
import { ToolButton, ResetButton } from "@/components/ui/tool-button";

const DEFAULT_YAML = `name: John Doe
age: 30
city: New York
hobbies:
- reading
- swimming
- coding
address:
street: 123 Main St
zipCode: '10001'`;

export default function YamlFormatter() {
  const { fields, updateField, resetFields } = usePersistentForm('yaml-formatter', {
    input: DEFAULT_YAML,
    output: "",
    error: null as string | null
  });

  const { input, output, error } = fields;

  const formatCode = () => {
    const { formatted, error: formatError } = formatYAML(input);
    updateField('output', formatted);
    updateField('error', formatError || null);
  };

  const handleInputChange = (value: string) => {
    updateField('input', value);
    // Clear output when input changes
    if (output) {
      updateField('output', '');
    }
  };

  const handleReset = () => {
    resetFields();
  };

  // Execute formatting with default value on component mount
  useToolDefault(() => {
    formatCode();
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          YAML Formatter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Format and normalize YAML with proper indentation
        </p>
      </div>

      {error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert> : null}

      {/* Controls */}
      <div className="mb-6 flex gap-3">
        <ToolButton
          variant="custom"
          onClick={formatCode}
          icon={<Code className="w-4 h-4 mr-2" />}
          tooltip="Format and beautify YAML code"
        >
          Format YAML
        </ToolButton>
        <ResetButton
          onClick={handleReset}
          tooltip="Reset to default YAML example"
        />
      </div>

      {/* Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>YAML Input</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={input}
              onChange={handleInputChange}
              placeholder="Paste your YAML here..."
              data-testid="yaml-input"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted YAML</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={output}
              onChange={() => { /* readonly output */ }}
              disabled={true}
              placeholder="Formatted YAML will appear here..."
              data-testid="yaml-output"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
