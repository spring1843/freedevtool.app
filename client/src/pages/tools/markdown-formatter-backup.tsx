import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { formatMarkdown } from "@/lib/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, RotateCcw } from "lucide-react";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import { useToolDefault } from "@/hooks/use-tool-default";

const DEFAULT_MARKDOWN = `# Heading 1


## Heading 2
This is a paragraph with some text.

### Heading 3


* List item 1
* List item 2
    * Nested item


\`\`\`javascript
const hello = 'world';
\`\`\`


Another paragraph here.`;

export default function MarkdownFormatter() {
  const { fields, updateField, resetFields } = usePersistentForm('markdown-formatter', {
    input: DEFAULT_MARKDOWN,
    output: "",
    error: null as string | null
  });

  const { input, output, error } = fields;

  const formatCode = () => {
    const { formatted, error: formatError } = formatMarkdown(input);
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

  // Execute Markdown formatting with default value on component mount
  useToolDefault(() => {
    formatCode();
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Markdown Formatter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Format and normalize Markdown with consistent spacing
        </p>
      </div>

      {error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert> : null}

      {/* Controls */}
      <div className="mb-6 flex gap-3">
        <Button onClick={formatCode} data-testid="format-markdown-button">
          <Code className="w-4 h-4 mr-2" />
          Format Markdown
        </Button>
        <Button onClick={resetFields} variant="outline" data-testid="reset-markdown-button">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Markdown Input</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={input}
              onChange={handleInputChange}
              placeholder="Paste your Markdown here..."
              data-testid="markdown-input"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted Markdown</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={output}
              onChange={() => {}}
              disabled={true}
              placeholder="Formatted Markdown will appear here..."
              data-testid="markdown-output"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
