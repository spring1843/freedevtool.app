import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countTextStats } from "@/lib/text-tools";
import { FileText, Hash, Type, List, FileIcon, BarChart3, RotateCcw } from "lucide-react";
import { usePersistentForm } from "@/hooks/use-persistent-state";

const defaultFields = {
  text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
};

export default function TextCounter() {
  const { fields, updateField, resetFields } = usePersistentForm('text-counter', defaultFields);

  const stats = countTextStats(fields.text);

  const statItems = [
    {
      label: "Characters",
      value: stats.characters,
      icon: Type,
      description: "Including spaces and punctuation"
    },
    {
      label: "Characters (no spaces)",
      value: stats.charactersNoSpaces,
      icon: Hash,
      description: "Excluding whitespace"
    },
    {
      label: "Words",
      value: stats.words,
      icon: FileText,
      description: "Separated by whitespace"
    },
    {
      label: "Sentences",
      value: stats.sentences,
      icon: List,
      description: "Ending with . ! or ?"
    },
    {
      label: "Paragraphs",
      value: stats.paragraphs,
      icon: FileIcon,
      description: "Separated by blank lines"
    },
    {
      label: "Lines",
      value: stats.lines,
      icon: BarChart3,
      description: "Total line breaks"
    },
    {
      label: "Data Size",
      value: stats.bytes,
      icon: FileIcon,
      description: "UTF-8 bytes (Unicode support)"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Text Counter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Count words, characters, sentences, paragraphs and more
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Input */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={fields.text}
              onChange={(e) => updateField('text', e.target.value)}
              placeholder="Enter or paste your text here..."
              className="min-h-[400px] font-mono text-sm"
              data-testid="text-input"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={resetFields} variant="outline" size="sm" data-testid="reset-button">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Text Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                    data-testid={`stat-${item.label.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {item.label}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg font-mono font-bold px-3 py-1">
                      {item.label === "Data Size" ? `${item.value.toLocaleString()} B` : item.value.toLocaleString()}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Reading Time Estimation */}
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Reading Time Estimate
              </h4>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div>
                  Average reader (200 WPM): ~{Math.max(1, Math.ceil(stats.words / 200))} minutes
                </div>
                <div>
                  Fast reader (300 WPM): ~{Math.max(1, Math.ceil(stats.words / 300))} minutes
                </div>
                <div>
                  Slow reader (150 WPM): ~{Math.max(1, Math.ceil(stats.words / 150))} minutes
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Additional Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Avg words per sentence:</span>
                  <span className="ml-2 font-mono">
                    {stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : '0'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Avg chars per word:</span>
                  <span className="ml-2 font-mono">
                    {stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : '0'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Sentences per paragraph:</span>
                  <span className="ml-2 font-mono">
                    {stats.paragraphs > 0 ? (stats.sentences / stats.paragraphs).toFixed(1) : '0'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Words per paragraph:</span>
                  <span className="ml-2 font-mono">
                    {stats.paragraphs > 0 ? (stats.words / stats.paragraphs).toFixed(1) : '0'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}