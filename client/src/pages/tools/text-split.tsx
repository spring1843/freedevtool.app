import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Split, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import AdSlot from "@/components/ui/ad-slot";
import { SecurityBanner } from "@/components/ui/security-banner";

const defaultText = `apple,banana,cherry
orange;grape;kiwi
red|green|blue`;

export default function TextSplit() {
  const [text, setText] = useState(defaultText);
  const [delimiter, setDelimiter] = useState(",");
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [splitResult, setSplitResult] = useState<string[]>([]);

  const splitText = () => {
    try {
      let parts: string[] = [];
      
      if (delimiter === '\\n') {
        parts = text.split('\n');
      } else if (delimiter === '\\t') {
        parts = text.split('\t');
      } else {
        parts = text.split(delimiter);
      }

      if (trimWhitespace) {
        parts = parts.map(part => part.trim());
      }

      if (removeEmpty) {
        parts = parts.filter(part => part.length > 0);
      }

      setSplitResult(parts);
    } catch (error) {
      setSplitResult([`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  const handleReset = () => {
    setText(defaultText);
    setDelimiter(",");
    setRemoveEmpty(true);
    setTrimWhitespace(true);
    setSplitResult([]);
  };

  useEffect(() => {
    splitText();
  }, []);

  const getDelimiterDisplay = (delim: string) => {
    switch (delim) {
      case '\\n': return 'New Line';
      case '\\t': return 'Tab';
      case ' ': return 'Space';
      default: return delim;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <AdSlot position="top" id="TS-001" size="large" className="mb-6" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Text Splitter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Split text into parts using custom delimiters
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Split Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="delimiter">Delimiter</Label>
            <Input
              id="delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              placeholder="Enter delimiter (e.g., comma, space, \\n, \\t)..."
              data-testid="delimiter-input"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Use \\n for new lines, \\t for tabs
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="remove-empty"
                checked={removeEmpty}
                onCheckedChange={setRemoveEmpty}
              />
              <Label htmlFor="remove-empty">Remove Empty Parts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="trim-whitespace"
                checked={trimWhitespace}
                onCheckedChange={setTrimWhitespace}
              />
              <Label htmlFor="trim-whitespace">Trim Whitespace</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                onClick={splitText}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Split className="w-4 h-4 mr-2" />
                Split Text
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Delimiter: {getDelimiterDisplay(delimiter)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to split..."
              data-testid="text-input"
              className="min-h-[300px] font-mono text-sm"
              rows={15}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Split Results
              <Badge variant="outline">
                {splitResult.length} parts
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {splitResult.length > 0 ? (
                splitResult.map((part, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 dark:bg-gray-800 rounded border-l-4 border-orange-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-mono text-sm flex-1 break-words">
                        {part || '<empty>'}
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Length: {part.length} characters
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No results yet. Enter text and click "Split Text".
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Common Delimiters:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-700 dark:text-blue-300">
          <div><span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">,</span> Comma</div>
          <div><span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">;</span> Semicolon</div>
          <div><span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">|</span> Pipe</div>
          <div><span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">\\n</span> New Line</div>
          <div><span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">\\t</span> Tab</div>
          <div><span className="font-mono bg-white dark:bg-gray-800 px-1 rounded"> </span> Space</div>
          <div><span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">:</span> Colon</div>
          <div><span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">-</span> Dash</div>
        </div>
      </div>

      <AdSlot position="sidebar" id="TS-002" size="medium" className="mt-6" />
    </div>
  );
}