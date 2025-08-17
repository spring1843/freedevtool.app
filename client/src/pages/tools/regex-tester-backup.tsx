import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { testRegex } from "@/lib/text-tools";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import type { RegexMatch } from "@/types/tools";
import { Checkbox } from "@/components/ui/checkbox";
import AdSlot from "@/components/ui/ad-slot";
import { useToolDefault } from "@/hooks/use-tool-default";
import { usePersistentForm } from "@/hooks/use-persistent-state";

const DEFAULT_PATTERN = "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b";
const DEFAULT_TEXT = `Contact us at:
support@example.com
admin@test.org
Invalid email: user@
Another valid one: john.doe+newsletter@company.co.uk
Not an email: just some text
sales@demo.net`;

export default function RegexTester() {
  const { fields, updateField, resetFields: _resetFields } = usePersistentForm('regex-tester', {
    pattern: DEFAULT_PATTERN,
    text: DEFAULT_TEXT,
    flags: "g",
    globalFlag: true,
    caseInsensitiveFlag: false,
    multilineFlag: false
  });

  const { pattern, text, flags, globalFlag, caseInsensitiveFlag, multilineFlag } = fields;
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateFlags = () => {
    let newFlags = "";
    if (globalFlag) newFlags += "g";
    if (caseInsensitiveFlag) newFlags += "i";
    if (multilineFlag) newFlags += "m";
    updateField('flags', newFlags);
  };

  const testPattern = () => {
    const { matches: testMatches, error: testError } = testRegex(pattern, text, flags);
    setMatches(testMatches);
    setError(testError || null);
  };

  const handlePatternChange = (value: string) => {
    updateField('pattern', value);
    // Clear results when pattern changes
    setMatches([]);
    setError(null);
  };

  const handleTextChange = (value: string) => {
    updateField('text', value);
    // Clear results when text changes
    setMatches([]);
  };

  const handleFlagChange = (flag: 'global' | 'caseInsensitive' | 'multiline', checked: boolean) => {
    updateField(flag === 'global' ? 'globalFlag' : flag === 'caseInsensitive' ? 'caseInsensitiveFlag' : 'multilineFlag', checked);
    
    // Update flags string
    let newFlags = "";
    if (flag === 'global' ? checked : globalFlag) newFlags += "g";
    if (flag === 'caseInsensitive' ? checked : caseInsensitiveFlag) newFlags += "i";
    if (flag === 'multiline' ? checked : multilineFlag) newFlags += "m";
    updateField('flags', newFlags);
  };

  const handleReset = () => {
    _resetFields();
    setMatches([]);
    setError(null);
  };

  // Execute regex test with default values on component mount
  useToolDefault(() => {
    testPattern();
  });

  const highlightMatches = (text: string, matches: RegexMatch[]): string => {
    if (matches.length === 0) return text;
    
    let result = text;
    let offset = 0;
    
    matches.forEach((match) => {
      const startTag = '<mark class="bg-yellow-200 dark:bg-yellow-800">';
      const endTag = '</mark>';
      const insertPos = match.index + offset;
      
      result = result.slice(0, insertPos) + 
               startTag + 
               result.slice(insertPos, insertPos + match.match.length) + 
               endTag + 
               result.slice(insertPos + match.match.length);
      
      offset += startTag.length + endTag.length;
    });
    
    return result;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="RT-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Regex Tester
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Test regular expressions with match highlighting and detailed results
        </p>
      </div>

      {error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert> : null}

      {/* Pattern Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Regular Expression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pattern">Pattern</Label>
            <Input
              id="pattern"
              value={pattern}
              onChange={(e) => handlePatternChange(e.target.value)}
              placeholder="Enter your regex pattern..."
              className="font-mono"
              data-testid="regex-pattern-input"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="global"
                checked={globalFlag}
                onCheckedChange={(checked) => handleFlagChange('global', checked as boolean)}
              />
              <Label htmlFor="global">Global (g)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="case-insensitive"
                checked={caseInsensitiveFlag}
                onCheckedChange={(checked) => handleFlagChange('caseInsensitive', checked as boolean)}
              />
              <Label htmlFor="case-insensitive">Case Insensitive (i)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="multiline"
                checked={multilineFlag}
                onCheckedChange={(checked) => handleFlagChange('multiline', checked as boolean)}
              />
              <Label htmlFor="multiline">Multiline (m)</Label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={testPattern} data-testid="test-regex-button">
              <Search className="w-4 h-4 mr-2" />
              Test Regex
            </Button>
            <Button onClick={handleReset} variant="outline" data-testid="reset-regex-button">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Text and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Input */}
        <Card>
          <CardHeader>
            <CardTitle>Test Text</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={text}
              onChange={handleTextChange}
              placeholder="Enter text to test against..."
              data-testid="regex-test-text"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Results
              <div className="ml-auto flex items-center text-sm">
                {matches.length > 0 ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {matches.length} match{matches.length !== 1 ? 'es' : ''}
                  </div>
                ) : (
                  <div className="flex items-center text-slate-500">
                    <XCircle className="w-4 h-4 mr-1" />
                    No matches
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length > 0 ? (
              <div className="space-y-4">
                {/* Highlighted text */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Text with Matches Highlighted</Label>
                  <div 
                    className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto custom-scrollbar"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatches(text, matches) 
                    }}
                  />
                </div>

                {/* Match details */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Match Details</Label>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                    {matches.map((match, index) => (
                      <div key={index} className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded">
                        <div className="flex justify-between items-start">
                          <code className="text-sm font-mono">{match.match}</code>
                          <span className="text-xs text-slate-500">Index: {match.index}</span>
                        </div>
                        {match.groups && match.groups.length > 0 ? <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            Groups: {match.groups.join(", ")}
                          </div> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                No matches found. Try adjusting your pattern or test text.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
