import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { ArrowRightLeft, ArrowRight, RotateCcw } from "lucide-react";
import { jsonToYaml, yamlToJson } from "@/lib/encoders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePersistentForm } from "@/hooks/use-persistent-state";

const DEFAULT_JSON = `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"],
  "address": {
    "street": "123 Main St",
    "zipCode": "10001"
  }
}`;

const DEFAULT_YAML = `name: Jane Smith
age: 28
city: San Francisco
hobbies:
  - hiking
  - photography
  - cooking
address:
  street: 456 Oak Avenue
  zipCode: '94102'
contact:
  email: jane@example.com
  phone: '+1-555-0123'`;

export default function JsonYamlConverter() {
  const { fields, updateField, resetFields } = usePersistentForm('json-yaml-converter', {
    jsonInput: DEFAULT_JSON,
    yamlOutput: "",
    yamlInput: DEFAULT_YAML,
    jsonOutput: "",
    error: null as string | null
  });

  const convertJsonToYaml = () => {
    const { result, error: conversionError } = jsonToYaml(fields.jsonInput);
    updateField('yamlOutput', result);
    updateField('error', conversionError || null);
  };

  const convertYamlToJson = () => {
    const { result, error: conversionError } = yamlToJson(fields.yamlInput);
    updateField('jsonOutput', result);
    updateField('error', conversionError || null);
  };

  const swapContent = () => {
    updateField('jsonInput', fields.jsonOutput || fields.yamlOutput);
    updateField('yamlInput', fields.jsonInput);
    updateField('jsonOutput', "");
    updateField('yamlOutput', "");
    updateField('error', null);
  };

  const handleJsonInputChange = (value: string) => {
    updateField('jsonInput', value);
    if (fields.yamlOutput) {
      updateField('yamlOutput', '');
      updateField('error', null);
    }
  };

  const handleYamlInputChange = (value: string) => {
    updateField('yamlInput', value);
    if (fields.jsonOutput) {
      updateField('jsonOutput', '');
      updateField('error', null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          JSON ↔ YAML Converter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Convert between JSON and YAML formats bidirectionally
        </p>
      </div>

      {fields.error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {fields.error}
          </AlertDescription>
        </Alert> : null}

      {/* JSON to YAML Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                JSON Input
                <div className="ml-auto flex gap-2">
                  <Button
                    onClick={convertJsonToYaml}
                    size="sm"
                    data-testid="json-to-yaml-button"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Convert to YAML
                  </Button>
                  <Button onClick={resetFields} size="sm" variant="outline" data-testid="reset-json-yaml-button">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TextEditorWithLines
                value={fields.jsonInput}
                onChange={handleJsonInputChange}
                placeholder="Enter JSON here..."
                data-testid="json-input"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>YAML Output</CardTitle>
            </CardHeader>
            <CardContent>
              <TextEditorWithLines
                value={fields.yamlOutput}
                onChange={() => { /* readonly output */ }}
                disabled={true}
                placeholder="YAML output will appear here..."
                data-testid="yaml-output"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-8">
        <Button
          onClick={swapContent}
          variant="outline"
          size="lg"
          data-testid="swap-content-button"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Swap Content
        </Button>
      </div>

      {/* YAML to JSON Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              YAML Input
              <Button
                onClick={convertYamlToJson}
                size="sm"
                className="ml-auto"
                data-testid="yaml-to-json-button"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Convert to JSON
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={fields.yamlInput}
              onChange={handleYamlInputChange}
              placeholder="Enter YAML here..."
              data-testid="yaml-input"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JSON Output</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={fields.jsonOutput}
              onChange={() => { /* readonly output */ }}
              disabled={true}
              placeholder="JSON output will appear here..."
              data-testid="json-output"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
