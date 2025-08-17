import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { computeTextDiff } from "@/lib/text-tools";
import { GitCompare, ArrowRightLeft, RotateCcw } from "lucide-react";
import type { DiffLine } from "@/types/tools";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import AdSlot from "@/components/ui/ad-slot";

const defaultFields = {
  text1: `Hello World
This is line 2
This is line 3
This line will be removed
Common line`,
  text2: `Hello World
This is line 2 modified
This is line 3
New line added here
Common line`
};

export default function TextDiff() {
  const { fields, updateField, resetFields } = usePersistentForm('text-diff', defaultFields);
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [diffStats, setDiffStats] = useState<{
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
    charactersAdded: number;
    charactersRemoved: number;
    charactersModified: number;
  } | null>(null);

  const computeDiff = () => {
    const result = computeTextDiff(fields.text1, fields.text2);
    setDiffResult(result.diff);
    setDiffStats(result.stats);
  };

  const swapTexts = () => {
    updateField('text1', fields.text2);
    updateField('text2', fields.text1);
    setDiffResult([]);
    setDiffStats(null);
  };

  const handleReset = () => {
    resetFields();
    setDiffResult([]);
    setDiffStats(null);
  };

  const renderDiffLine = (line: DiffLine, index: number) => {
    let className = "flex font-mono text-sm";
    let prefix = " ";
    let bgClass = "";
    
    switch (line.type) {
      case 'add':
        className += " diff-line-add";
        bgClass = " bg-green-50 dark:bg-green-950/20";
        prefix = "+";
        break;
      case 'remove':
        className += " diff-line-remove";
        bgClass = " bg-red-50 dark:bg-red-950/20";
        prefix = "-";
        break;
      default:
        bgClass = " bg-slate-50 dark:bg-slate-800";
        prefix = " ";
    }

    return (
      <div key={index} className={className + bgClass}>
        {/* Line number */}
        <div className="flex-shrink-0 w-16 px-3 py-1 text-right text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 select-none">
          {line.lineNumber || ''}
        </div>
        {/* Diff prefix */}
        <div className="flex-shrink-0 w-6 px-1 py-1 text-center">
          <span className="text-slate-400">{prefix}</span>
        </div>
        {/* Content */}
        <div className="flex-1 px-2 py-1">
          <span 
            dangerouslySetInnerHTML={{ 
              __html: line.highlightedContent || line.content || '\u00A0' 
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="TD-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Text Diff Viewer
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Compare two texts side by side and see the differences
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button onClick={computeDiff} data-testid="compute-diff-button">
          <GitCompare className="w-4 h-4 mr-2" />
          Compare Texts
        </Button>
        <Button onClick={swapTexts} variant="outline" data-testid="swap-texts-button">
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Swap Texts
        </Button>
        <Button onClick={handleReset} variant="outline" data-testid="reset-button">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Input Section */}
      {/* Middle Ad */}
      <div className="flex justify-center mb-6">
        <AdSlot position="middle" id="TD-002" size="medium" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Original Text</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={fields.text1}
              onChange={(value) => updateField('text1', value)}
              placeholder="Enter original text here..."
              className="min-h-[300px]"
              data-testid="original-text-editor"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">Modified Text</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={fields.text2}
              onChange={(value) => updateField('text2', value)}
              placeholder="Enter modified text here..."
              className="min-h-[300px]"
              data-testid="modified-text-editor"
            />
          </CardContent>
        </Card>
      </div>

      {/* Diff Result */}
      {diffResult.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <GitCompare className="w-5 h-5 mr-2" />
              Diff Result ({diffResult.length} changes)
            </CardTitle>
            
            {/* Diff Statistics */}
            {diffStats ? <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Change Statistics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Lines</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400">+{diffStats.linesAdded}</span>
                        <span className="text-red-600 dark:text-red-400">-{diffStats.linesRemoved}</span>
                        <span className="text-blue-600 dark:text-blue-400">~{diffStats.linesModified}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Characters</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400">+{diffStats.charactersAdded}</span>
                        <span className="text-red-600 dark:text-red-400">-{diffStats.charactersRemoved}</span>
                        <span className="text-blue-600 dark:text-blue-400">~{diffStats.charactersModified}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Net Change</div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div>Lines: <span className="font-mono font-bold">
                          {diffStats.linesAdded - diffStats.linesRemoved > 0 ? '+' : ''}{diffStats.linesAdded - diffStats.linesRemoved}
                        </span></div>
                        <div>Chars: <span className="font-mono font-bold">
                          {diffStats.charactersAdded - diffStats.charactersRemoved > 0 ? '+' : ''}{diffStats.charactersAdded - diffStats.charactersRemoved}
                        </span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> : null}
          </CardHeader>
          <CardContent>
            <div className="border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="text-xs text-slate-500 dark:text-slate-400 px-3 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                Line-by-line comparison with GitHub-style formatting
              </div>
              <div className="max-h-96 overflow-auto">
                {diffResult.map((line, index) => renderDiffLine(line, index))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center space-x-6 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-200 dark:bg-green-800 border-l-2 border-green-500 mr-2" />
                <span className="text-slate-600 dark:text-slate-400">Added lines</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-200 dark:bg-red-800 border-l-2 border-red-500 mr-2" />
                <span className="text-slate-600 dark:text-slate-400">Removed lines</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 mr-2" />
                <span className="text-slate-600 dark:text-slate-400">Unchanged lines</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="TD-003" size="large" />
      </div>
    </div>
  );
}
