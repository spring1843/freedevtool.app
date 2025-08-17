import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Split, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";
import { usePersistentForm } from "@/hooks/use-persistent-state";

export default function TextSplit() {
  const { fields, updateField } = usePersistentForm('text-split', {
    text: `apple,banana,cherry
orange;grape;kiwi
red|green|blue`,
    delimiter: ",",
    removeEmpty: true,
    trimWhitespace: true,
    splitResult: [] as string[]
  });
  const { toast } = useToast();

  const splitText = () => {
    if (!fields.text.trim()) {
      updateField('splitResult', []);
      return;
    }

    // Handle special delimiters
    let actualDelimiter = fields.delimiter;
    if (fields.delimiter === "\\n") actualDelimiter = "\n";
    if (fields.delimiter === "\\t") actualDelimiter = "\t";
    if (fields.delimiter === "\\r") actualDelimiter = "\r";

    let parts = fields.text.split(actualDelimiter);
    
    if (fields.trimWhitespace) {
      parts = parts.map(part => part.trim());
    }
    
    if (fields.removeEmpty) {
      parts = parts.filter(part => part.length > 0);
    }
    
    updateField('splitResult', parts);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const downloadAsFile = () => {
    const content = fields.splitResult.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'split-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="TS-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Text Split Tool
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Split text by custom delimiters into separate lines or parts
        </p>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center mb-6">
        <AdSlot position="middle" id="TS-002" size="medium" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Text & Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input-text">Text to Split</Label>
              <Textarea
                id="input-text"
                value={fields.text}
                onChange={(e) => updateField('text', e.target.value)}
                placeholder="Enter text to split..."
                className="min-h-[200px] font-mono"
                data-testid="input-text"
                showLineNumbers={true}
                showStats={true}
              />
            </div>

            <div>
              <Label htmlFor="delimiter">Delimiter</Label>
              <Input
                id="delimiter"
                value={fields.delimiter}
                onChange={(e) => updateField('delimiter', e.target.value)}
                placeholder="Enter delimiter (e.g., ,;|\\n\\t)"
                data-testid="delimiter-input"
              />
              <div className="text-sm text-slate-500 mt-1">
                Use \\n for newline, \\t for tab, \\r for carriage return
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={fields.removeEmpty}
                  onChange={(e) => updateField('removeEmpty', e.target.checked)}
                  data-testid="remove-empty-checkbox"
                />
                <span>Remove empty parts</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={fields.trimWhitespace}
                  onChange={(e) => updateField('trimWhitespace', e.target.checked)}
                  data-testid="trim-whitespace-checkbox"
                />
                <span>Trim whitespace</span>
              </label>
            </div>

            <Button onClick={splitText} className="w-full" data-testid="split-button">
              <Split className="w-4 h-4 mr-2" />
              Split Text
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Split Results</span>
              <Badge variant="secondary" data-testid="result-count">
                {fields.splitResult.length} parts
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fields.splitResult.length > 0 ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(fields.splitResult.join('\n'))}
                    variant="outline"
                    size="sm"
                    data-testid="copy-all-button"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                  <Button
                    onClick={downloadAsFile}
                    variant="outline"
                    size="sm"
                    data-testid="download-button"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {fields.splitResult.map((part, index) => (
                      <div
                        key={index}
                        className="p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm"
                        data-testid={`result-part-${index}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-500">Part {index + 1}</span>
                          <Button
                            onClick={() => copyToClipboard(part)}
                            variant="ghost"
                            size="sm"
                            data-testid={`copy-part-${index}`}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="whitespace-pre-wrap break-all">{part || '(empty)'}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                Enter text and click "Split Text" to see results
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="TS-003" size="large" />
      </div>
    </div>
  );
}