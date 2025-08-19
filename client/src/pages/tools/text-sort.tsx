import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";

type SortType = "alphabetical" | "numerical" | "length" | "reverse";
type SortOrder = "asc" | "desc";

const defaultInput = `banana
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
short`;

export default function TextSorter() {
  const [input, setInput] = useState(defaultInput);
  const [sortType, setSortType] = useState<SortType>("alphabetical");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [sortedOutput, setSortedOutput] = useState("");

  const sortText = () => {
    const lines = input.split("\n").filter(line => line.trim() !== "");

    const sorted = [...lines];

    switch (sortType) {
      case "alphabetical":
        sorted.sort((a, b) => {
          const strA = caseSensitive ? a : a.toLowerCase();
          const strB = caseSensitive ? b : b.toLowerCase();
          return strA.localeCompare(strB);
        });
        break;
      case "numerical":
        sorted.sort((a, b) => {
          const numA = parseFloat(a);
          const numB = parseFloat(b);
          if (isNaN(numA) && isNaN(numB)) return 0;
          if (isNaN(numA)) return 1;
          if (isNaN(numB)) return -1;
          return numA - numB;
        });
        break;
      case "length":
        sorted.sort((a, b) => a.length - b.length);
        break;
      case "reverse":
        sorted.reverse();
        break;
      default: {
        // Handle default case
      }
    }

    if (sortOrder === "desc" && sortType !== "reverse") {
      sorted.reverse();
    }

    setSortedOutput(sorted.join("\n"));
  };

  const handleReset = () => {
    setInput(defaultInput);
    setSortType("alphabetical");
    setSortOrder("asc");
    setCaseSensitive(false);
    setSortedOutput("");
  };

  useEffect(() => {
    sortText();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Text Sorter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Sort lines of text alphabetically, numerically, or by length
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sort Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="sort-type">Sort Type</Label>
              <Select
                value={sortType}
                onValueChange={(value: SortType) => setSortType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="numerical">Numerical</SelectItem>
                  <SelectItem value="length">By Length</SelectItem>
                  <SelectItem value="reverse">Reverse Lines</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-order">Sort Order</Label>
              <Select
                value={sortOrder}
                onValueChange={(value: SortOrder) => setSortOrder(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <Switch
                id="case-sensitive"
                checked={caseSensitive}
                onCheckedChange={setCaseSensitive}
              />
              <Label htmlFor="case-sensitive">Case Sensitive</Label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={sortText}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sort Text
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
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
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter lines of text to sort..."
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
            <CardTitle>Sorted Output</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sortedOutput}
              readOnly={true}
              placeholder="Sorted text will appear here..."
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
