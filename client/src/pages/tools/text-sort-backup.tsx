import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { sortText } from "@/lib/text-tools";
import { ArrowUpDown, ArrowUp, ArrowDown, Lightbulb, RotateCcw } from "lucide-react";
import type { SortOrder, SortType } from "@/types/tools";
import { Checkbox } from "@/components/ui/checkbox";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import AdSlot from "@/components/ui/ad-slot";

const defaultFields = {
  input: `banana
apple
Cherry
apple
date
elderberry
Fig
grape
banana
11
2
100
21
Cherry
short
a very long line of text
medium line
short`,
  sortType: "alphabetical" as SortType,
  sortOrder: "asc" as SortOrder,
  caseSensitive: false
};

export default function TextSort() {
  const { fields, updateField, resetFields } = usePersistentForm('text-sort', defaultFields);
  const [output, setOutput] = useState("");

  const sortOptions = [
    { value: "alphabetical", label: "Alphabetical" },
    { value: "numerical", label: "Numerical" },
    { value: "length", label: "By Length" },
  ];

  const performSort = () => {
    const result = sortText(fields.input, fields.sortType, fields.sortOrder, fields.caseSensitive);
    setOutput(result);
  };

  const reverseOrder = () => {
    updateField('sortOrder', fields.sortOrder === "asc" ? "desc" : "asc");
  };

  const removeDuplicates = () => {
    // Work with the current sorted output if available, otherwise use input
    const textToProcess = output || fields.input;
    const lines = textToProcess.split('\n');
    const unique = Array.from(new Set(lines));
    setOutput(unique.join('\n'));
  };

  const removeEmptyLines = () => {
    // Work with the current sorted output if available, otherwise use input
    const textToProcess = output || fields.input;
    const lines = textToProcess.split('\n');
    const nonEmpty = lines.filter(line => line.trim().length > 0);
    setOutput(nonEmpty.join('\n'));
  };

  const getLineStats = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return {
      total: lines.length,
      unique: new Set(lines).size,
      longest: Math.max(...lines.map(line => line.length)),
      shortest: Math.min(...lines.map(line => line.length))
    };
  };

  const inputStats = getLineStats(fields.input);
  const outputStats = output ? getLineStats(output) : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="SO-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Text Sort
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Sort text lines alphabetically, numerically, or by length
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sort Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="sort-type">Sort Type</Label>
              <Select value={fields.sortType} onValueChange={(value) => updateField('sortType', value as SortType)}>
                <SelectTrigger data-testid="sort-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-order">Sort Order</Label>
              <Select value={fields.sortOrder} onValueChange={(value) => updateField('sortOrder', value as SortOrder)}>
                <SelectTrigger data-testid="sort-order-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="case-sensitive"
                  checked={fields.caseSensitive}
                  onCheckedChange={(checked) => updateField('caseSensitive', checked as boolean)}
                  data-testid="case-sensitive-checkbox"
                />
                <Label htmlFor="case-sensitive">Case Sensitive</Label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={performSort} data-testid="sort-button">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sort Text
            </Button>
            <Button onClick={reverseOrder} variant="outline" data-testid="reverse-order-button">
              {fields.sortOrder === "asc" ? (
                <ArrowDown className="w-4 h-4 mr-2" />
              ) : (
                <ArrowUp className="w-4 h-4 mr-2" />
              )}
              {fields.sortOrder === "asc" ? "Descending" : "Ascending"}
            </Button>
            <Button onClick={resetFields} variant="outline" data-testid="reset-button">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={removeDuplicates} variant="outline" data-testid="remove-duplicates-button">
              Remove Duplicates
            </Button>
            <Button onClick={removeEmptyLines} variant="outline" data-testid="remove-empty-lines-button">
              Remove Empty Lines
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Input Text
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {inputStats.total} lines
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={fields.input}
              onChange={(value) => updateField('input', value)}
              placeholder="Enter text lines to sort..."
              data-testid="text-sort-input"
              className="min-h-[400px]"
            />
            
            {/* Input Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-slate-600 dark:text-slate-400">
                  Total lines: <span className="font-mono">{inputStats.total}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Unique lines: <span className="font-mono">{inputStats.unique}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-600 dark:text-slate-400">
                  Longest: <span className="font-mono">{inputStats.longest} chars</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Shortest: <span className="font-mono">{inputStats.shortest} chars</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sorted Output
              {outputStats ? <div className="text-sm text-slate-500 dark:text-slate-400">
                  {outputStats.total} lines
                </div> : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={output}
              onChange={() => { /* readonly output */ }}
              disabled={true}
              placeholder="Sorted text will appear here..."
              data-testid="text-sort-output"
              className="min-h-[400px]"
            />
            
            {/* Output Stats */}
            {outputStats ? <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-slate-600 dark:text-slate-400">
                    Total lines: <span className="font-mono">{outputStats.total}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Unique lines: <span className="font-mono">{outputStats.unique}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-600 dark:text-slate-400">
                    Longest: <span className="font-mono">{outputStats.longest} chars</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Shortest: <span className="font-mono">{outputStats.shortest} chars</span>
                  </div>
                </div>
              </div> : null}
          </CardContent>
        </Card>
      </div>

      {/* Pro Tips */}
      <div className="mt-8">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Lightbulb className="text-blue-600 dark:text-blue-400 mt-1 h-5 w-5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Pro Tips</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Numerical sorting recognizes numbers within text (e.g., "file10.txt" comes after "file2.txt")</li>
                  <li>• Length sorting maintains alphabetical order for lines of equal length</li>
                  <li>• Use "Remove Duplicates" to clean up repeated lines before sorting</li>
                  <li>• Case sensitivity affects both alphabetical and length sorting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
