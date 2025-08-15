import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { Badge } from "@/components/ui/badge";
import { Replace, Copy, Download, AlertCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";
import { usePersistentForm } from "@/hooks/use-persistent-state";

const DEFAULT_TEXT = `Hello World! This is a sample text.
Hello everyone! Welcome to our website.
Have a great day! Hello and goodbye.`;

export default function SearchReplace() {
  const { fields, updateField, resetFields } = usePersistentForm('search-replace', {
    text: DEFAULT_TEXT,
    searchText: "Hello",
    replaceText: "Hi",
    isRegex: false,
    isCaseSensitive: false,
    isGlobal: true,
    result: "",
    matchCount: 0,
    error: ""
  });

  const { text, searchText, replaceText, isRegex, isCaseSensitive, isGlobal, result, matchCount, error } = fields;
  const { toast } = useToast();

  const performSearchReplace = () => {
    if (!text.trim() || !searchText) {
      updateField('result', "");
      updateField('matchCount', 0);
      return;
    }

    try {
      updateField('error', "");
      const searchPattern = searchText;
      let flags = '';
      
      if (isGlobal) flags += 'g';
      if (!isCaseSensitive) flags += 'i';

      let regex: RegExp;
      if (isRegex) {
        regex = new RegExp(searchPattern, flags);
      } else {
        // Escape special regex characters for literal search
        const escapedSearch = searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(escapedSearch, flags);
      }

      // Count matches before replacement
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      updateField('matchCount', count);

      // Perform replacement
      const replacedText = text.replace(regex, replaceText);
      updateField('result', replacedText);
    } catch {
      updateField('error', 'Invalid regex pattern');
      updateField('result', "");
      updateField('matchCount', 0);
    }
  };

  const handleTextChange = (value: string) => {
    updateField('text', value);
    if (result) {
      updateField('result', '');
      updateField('matchCount', 0);
      updateField('error', '');
    }
  };

  const handleSearchTextChange = (value: string) => {
    updateField('searchText', value);
    if (result) {
      updateField('result', '');
      updateField('matchCount', 0);
      updateField('error', '');
    }
  };

  const handleReplaceTextChange = (value: string) => {
    updateField('replaceText', value);
    if (result) {
      updateField('result', '');
      updateField('matchCount', 0);
      updateField('error', '');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const downloadAsFile = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search-replace-result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="SR-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Search & Replace Tool
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Find and replace text with support for regular expressions and case sensitivity
        </p>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center mb-6">
        <AdSlot position="middle" id="SR-002" size="medium" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Replace Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input-text">Original Text</Label>
              <TextEditorWithLines
                value={text}
                onChange={handleTextChange}
                placeholder="Enter text to search in..."
                className="min-h-[200px]"
                data-testid="input-text"
              />
            </div>

            <div>
              <Label htmlFor="search-text">Search For</Label>
              <Input
                id="search-text"
                value={searchText}
                onChange={(e) => handleSearchTextChange(e.target.value)}
                placeholder="Enter text to search for..."
                data-testid="search-text-input"
              />
            </div>

            <div>
              <Label htmlFor="replace-text">Replace With</Label>
              <Input
                id="replace-text"
                value={replaceText}
                onChange={(e) => handleReplaceTextChange(e.target.value)}
                placeholder="Enter replacement text..."
                data-testid="replace-text-input"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isRegex}
                  onChange={(e) => updateField('isRegex', e.target.checked)}
                  data-testid="regex-checkbox"
                />
                <span>Use Regular Expressions</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isCaseSensitive}
                  onChange={(e) => updateField('isCaseSensitive', e.target.checked)}
                  data-testid="case-sensitive-checkbox"
                />
                <span>Case Sensitive</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => updateField('isGlobal', e.target.checked)}
                  data-testid="global-checkbox"
                />
                <span>Replace All Occurrences</span>
              </label>
            </div>

            {error ? <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div> : null}

            <div className="flex gap-2">
              <Button onClick={performSearchReplace} className="flex-1" data-testid="search-replace-button">
                <Replace className="w-4 h-4 mr-2" />
                Search & Replace
              </Button>
              <Button onClick={resetFields} variant="outline" data-testid="reset-search-replace-button">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Results</span>
              <Badge variant="secondary" data-testid="match-count">
                {matchCount} matches found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result || matchCount > 0 ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(result)}
                    variant="outline"
                    size="sm"
                    data-testid="copy-result-button"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Result
                  </Button>
                  <Button
                    onClick={downloadAsFile}
                    variant="outline"
                    size="sm"
                    data-testid="download-result-button"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div>
                  <Label>Replaced Text</Label>
                  <TextEditorWithLines
                    value={result}
                    onChange={() => {}}
                    disabled={true}
                    className="min-h-[300px] bg-slate-50 dark:bg-slate-800"
                    data-testid="result-text"
                  />
                </div>

                {matchCount > 0 && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
                    Successfully replaced {matchCount} occurrence{matchCount !== 1 ? 's' : ''} of "{searchText}"
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                Enter search terms and click "Search & Replace" to see results
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="SR-003" size="large" />
      </div>
    </div>
  );
}