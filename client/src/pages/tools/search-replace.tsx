import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";
import {
  DEFAULT_SEARCH_REPLACE_TEXT,
  DEFAULT_SEARCH_REPLACE_SEARCH,
  DEFAULT_SEARCH_REPLACE_REPLACE,
} from "@/data/defaults";

export default function SearchReplace() {
  const [text, setText] = useState(DEFAULT_SEARCH_REPLACE_TEXT);
  const [searchText, setSearchText] = useState(DEFAULT_SEARCH_REPLACE_SEARCH);
  const [replaceText, setReplaceText] = useState(
    DEFAULT_SEARCH_REPLACE_REPLACE
  );
  const [isRegex, setIsRegex] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isGlobal, setIsGlobal] = useState(true);
  const [result, setResult] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [error, setError] = useState("");

  const performSearchReplace = useCallback(() => {
    try {
      setError("");

      if (!searchText) {
        setError("Search text cannot be empty");
        return;
      }

      let searchPattern: string | RegExp = searchText;

      if (isRegex) {
        let flags = "";
        if (!isCaseSensitive) flags += "i";
        if (isGlobal) flags += "g";

        try {
          searchPattern = new RegExp(searchText, flags);
        } catch (regexError) {
          setError(
            `Invalid regex pattern: ${regexError instanceof Error ? regexError.message : String(regexError)}`
          );
          return;
        }
      } else {
        // Escape special regex characters for literal search
        const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        let flags = "";
        if (!isCaseSensitive) flags += "i";
        if (isGlobal) flags += "g";
        searchPattern = new RegExp(escapedSearch, flags);
      }

      // Count matches
      const matches = text.match(searchPattern);
      setMatchCount(matches ? matches.length : 0);

      // Perform replacement
      const replacedText = text.replace(searchPattern, replaceText);
      setResult(replacedText);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setResult("");
      setMatchCount(0);
    }
  }, [text, searchText, replaceText, isRegex, isCaseSensitive, isGlobal]);

  const handleReset = () => {
    setText(DEFAULT_SEARCH_REPLACE_TEXT);
    setSearchText(DEFAULT_SEARCH_REPLACE_SEARCH);
    setReplaceText(DEFAULT_SEARCH_REPLACE_REPLACE);
    setIsRegex(false);
    setIsCaseSensitive(false);
    setIsGlobal(true);
    setResult("");
    setMatchCount(0);
    setError("");
  };

  useEffect(() => {
    performSearchReplace();
  }, [performSearchReplace]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Search & Replace
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Find and replace text with regex support
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Replace Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search-text">Search For</Label>
              <Input
                id="search-text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Text to search for..."
                data-testid="search-input"
              />
            </div>
            <div>
              <Label htmlFor="replace-text">Replace With</Label>
              <Input
                id="replace-text"
                value={replaceText}
                onChange={e => setReplaceText(e.target.value)}
                placeholder="Replacement text..."
                data-testid="replace-input"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="regex-mode"
                checked={isRegex}
                onCheckedChange={setIsRegex}
              />
              <Label htmlFor="regex-mode">Regular Expression</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="case-sensitive"
                checked={isCaseSensitive}
                onCheckedChange={setIsCaseSensitive}
              />
              <Label htmlFor="case-sensitive">Case Sensitive</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="global-replace"
                checked={isGlobal}
                onCheckedChange={setIsGlobal}
              />
              <Label htmlFor="global-replace">Replace All</Label>
            </div>
          </div>

          {error ? (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                onClick={performSearchReplace}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Search & Replace
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {matchCount} matches found
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Original Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter text to search and replace..."
              data-testid="text-input"
              className="min-h-[400px] font-mono text-sm"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={result}
              readOnly={true}
              placeholder="Search and replace results will appear here..."
              data-testid="text-output"
              className="min-h-[400px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
