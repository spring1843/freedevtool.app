import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";

const DEFAULT_PATTERN =
  "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b";
const DEFAULT_TEXT = `Here are some email addresses:
john.doe@example.com
jane_smith123@company.org
test.email+tag@domain.co.uk
invalid.email@
another@valid-domain.net
not-an-email-address
support@website.info`;

interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

export default function RegexTester() {
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [flags, setFlags] = useState("g");
  const [globalFlag, setGlobalFlag] = useState(true);
  const [caseInsensitiveFlag, setCaseInsensitiveFlag] = useState(false);
  const [multilineFlag, setMultilineFlag] = useState(false);
  const [matches, setMatches] = useState<RegexMatch[]>([]);
  const [isValidRegex, setIsValidRegex] = useState(true);
  const [error, setError] = useState("");

  const updateFlags = () => {
    let newFlags = "";
    if (globalFlag) newFlags += "g";
    if (caseInsensitiveFlag) newFlags += "i";
    if (multilineFlag) newFlags += "m";
    setFlags(newFlags);
  };

  const testRegex = () => {
    try {
      setError("");
      const regex = new RegExp(pattern, flags);
      setIsValidRegex(true);

      const foundMatches: RegexMatch[] = [];
      let match;

      if (globalFlag) {
        while ((match = regex.exec(text)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });

          // Prevent infinite loop
          if (!regex.global) break;
        }
      } else {
        match = regex.exec(text);
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setMatches(foundMatches);
    } catch (err) {
      setIsValidRegex(false);
      setError(
        `Invalid regex: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setMatches([]);
    }
  };

  const handleReset = () => {
    setPattern(DEFAULT_PATTERN);
    setText(DEFAULT_TEXT);
    setFlags("g");
    setGlobalFlag(true);
    setCaseInsensitiveFlag(false);
    setMultilineFlag(false);
    setMatches([]);
    setIsValidRegex(true);
    setError("");
  };

  useEffect(() => {
    updateFlags();
  }, [globalFlag, caseInsensitiveFlag, multilineFlag]);

  useEffect(() => {
    testRegex();
  }, []);

  const highlightMatches = (text: string, matches: RegexMatch[]) => {
    if (matches.length === 0) return text;

    let highlighted = text;
    let offset = 0;

    matches.forEach(match => {
      const start = match.index + offset;
      const end = start + match.match.length;
      const highlightedMatch = `<mark class="bg-yellow-200 dark:bg-yellow-800">${match.match}</mark>`;
      highlighted =
        highlighted.slice(0, start) + highlightedMatch + highlighted.slice(end);
      offset += highlightedMatch.length - match.match.length;
    });

    return highlighted;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Regex Tester
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Test regular expressions with live matches and validation
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Regular Expression
            <div className="flex items-center">
              {isValidRegex ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Valid
                </div>
              ) : (
                <div className="flex items-center text-red-600 text-sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  Invalid
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="regex-pattern">Pattern</Label>
            <Input
              id="regex-pattern"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              data-testid="regex-pattern"
              className={`font-mono ${!isValidRegex ? "border-red-500" : ""}`}
            />
            {error ? (
              <div className="text-sm text-red-600 mt-1">{error}</div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="global-flag"
                checked={globalFlag}
                onCheckedChange={setGlobalFlag}
              />
              <Label htmlFor="global-flag">Global (g)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="case-insensitive"
                checked={caseInsensitiveFlag}
                onCheckedChange={setCaseInsensitiveFlag}
              />
              <Label htmlFor="case-insensitive">Ignore Case (i)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="multiline"
                checked={multilineFlag}
                onCheckedChange={setMultilineFlag}
              />
              <Label htmlFor="multiline">Multiline (m)</Label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                onClick={testRegex}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Test Regex
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
              {matches.length} matches found
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter text to test against..."
              data-testid="test-text"
              className="min-h-[300px] font-mono text-sm resize-none"
              rows={15}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highlighted Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="min-h-[300px] p-3 border rounded-md bg-gray-50 dark:bg-gray-800 font-mono text-sm whitespace-pre-wrap overflow-auto"
              dangerouslySetInnerHTML={{
                __html: highlightMatches(text, matches),
              }}
            />
          </CardContent>
        </Card>
      </div>

      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Match</th>
                    <th className="text-left p-2">Position</th>
                    <th className="text-left p-2">Length</th>
                    <th className="text-left p-2">Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-mono bg-yellow-50 dark:bg-yellow-900/20">
                        {match.match}
                      </td>
                      <td className="p-2">{match.index}</td>
                      <td className="p-2">{match.match.length}</td>
                      <td className="p-2">
                        {match.groups.length > 0
                          ? match.groups.join(", ")
                          : "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
