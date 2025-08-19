import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GitCompare, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";

interface DiffLine {
  type: "added" | "removed" | "unchanged" | "modified";
  line1?: string;
  line2?: string;
  lineNumber1?: number;
  lineNumber2?: number;
}

const defaultText1 = `Hello World
This is line 2
This is line 3
This line will be removed
Common line`;

const defaultText2 = `Hello World
This is line 2 modified
This is line 3
New line added here
Common line`;

export default function TextDiff() {
  const [text1, setText1] = useState(defaultText1);
  const [text2, setText2] = useState(defaultText2);
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [diffStats, setDiffStats] = useState<{
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
    charactersAdded: number;
    charactersRemoved: number;
    charactersModified: number;
  } | null>(null);

  const calculateDiff = () => {
    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const result: DiffLine[] = [];

    const stats = {
      linesAdded: 0,
      linesRemoved: 0,
      linesModified: 0,
      charactersAdded: 0,
      charactersRemoved: 0,
      charactersModified: 0,
    };

    const maxLines = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === undefined) {
        // Line added in text2
        result.push({
          type: "added",
          line2,
          lineNumber2: i + 1,
        });
        stats.linesAdded++;
        stats.charactersAdded += line2.length;
      } else if (line2 === undefined) {
        // Line removed from text1
        result.push({
          type: "removed",
          line1,
          lineNumber1: i + 1,
        });
        stats.linesRemoved++;
        stats.charactersRemoved += line1.length;
      } else if (line1 === line2) {
        // Lines are identical
        result.push({
          type: "unchanged",
          line1,
          line2,
          lineNumber1: i + 1,
          lineNumber2: i + 1,
        });
      } else {
        // Lines are different
        result.push({
          type: "modified",
          line1,
          line2,
          lineNumber1: i + 1,
          lineNumber2: i + 1,
        });
        stats.linesModified++;
        stats.charactersModified += Math.abs(line1.length - line2.length);
      }
    }

    setDiffResult(result);
    setDiffStats(stats);
  };

  const handleReset = () => {
    setText1(defaultText1);
    setText2(defaultText2);
    setDiffResult([]);
    setDiffStats(null);
  };

  useEffect(() => {
    calculateDiff();
  }, []);

  const renderDiffLine = (diff: DiffLine, index: number) => {
    const getLineClass = (type: string) => {
      switch (type) {
        case "added":
          return "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500";
        case "removed":
          return "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500";
        case "modified":
          return "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500";
        default:
          return "bg-gray-50 dark:bg-gray-800";
      }
    };

    return (
      <div key={index} className={`p-2 ${getLineClass(diff.type)}`}>
        <div className="grid grid-cols-2 gap-4 text-sm font-mono">
          <div>
            {diff.lineNumber1 ? (
              <span className="text-gray-500 mr-2">{diff.lineNumber1}:</span>
            ) : null}
            {diff.line1 || ""}
          </div>
          <div>
            {diff.lineNumber2 ? (
              <span className="text-gray-500 mr-2">{diff.lineNumber2}:</span>
            ) : null}
            {diff.line2 || ""}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Text Diff
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Compare text differences side by side with detailed statistics
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      {diffStats ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Diff Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                +{diffStats.linesAdded} lines
              </Badge>
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                -{diffStats.linesRemoved} lines
              </Badge>
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                ~{diffStats.linesModified} modified
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {diffStats.charactersAdded +
                  diffStats.charactersRemoved +
                  diffStats.charactersModified}{" "}
                chars changed
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-6 flex gap-3">
        <Button
          onClick={calculateDiff}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <GitCompare className="w-4 h-4 mr-2" />
          Compare Text
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Text 1 (Original)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text1}
              onChange={e => setText1(e.target.value)}
              placeholder="Enter original text here..."
              data-testid="text1-input"
              className="min-h-[300px] font-mono text-sm"
              rows={15}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">
              Text 2 (Modified)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text2}
              onChange={e => setText2(e.target.value)}
              placeholder="Enter modified text here..."
              data-testid="text2-input"
              className="min-h-[300px] font-mono text-sm"
              rows={15}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>

      {diffResult.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Diff Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-100 dark:bg-gray-800 border-b font-semibold text-sm">
                <div>Original (Text 1)</div>
                <div>Modified (Text 2)</div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {diffResult.map((diff, index) => renderDiffLine(diff, index))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
