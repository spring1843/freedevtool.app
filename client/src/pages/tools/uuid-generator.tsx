import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Copy, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";
import {
  DEFAULT_UUID_GENERATOR_COUNT,
  DEFAULT_UUID_GENERATOR_VERSION,
  DEFAULT_UUID_GENERATOR_FORMAT,
} from "@/data/defaults";

export default function UUIDGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [version, setVersion] = useState<1 | 4>(
    DEFAULT_UUID_GENERATOR_VERSION as 1 | 4
  );
  const [count, setCount] = useState(DEFAULT_UUID_GENERATOR_COUNT);
  const [format, setFormat] = useState<
    "standard" | "uppercase" | "lowercase" | "nodashes" | "brackets"
  >(
    DEFAULT_UUID_GENERATOR_FORMAT as
      | "standard"
      | "uppercase"
      | "lowercase"
      | "nodashes"
      | "brackets"
  );

  const generateUUID = useCallback(() => {
    const newUuids: string[] = [];

    for (let i = 0; i < count; i++) {
      let uuid: string;

      if (version === 4) {
        // Generate UUID v4 (random)
        uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      } else {
        // Generate UUID v1 (timestamp-based) - simplified version
        const timestamp = Date.now();
        const timestampHex = timestamp.toString(16).padStart(12, "0");
        const randomPart = Math.random().toString(16).substring(2, 15);
        uuid = `${timestampHex.substring(0, 8)}-${timestampHex.substring(8)}-1${randomPart.substring(0, 3)}-a${randomPart.substring(3, 6)}-${randomPart.substring(6, 18)}`;
      }

      // Apply formatting
      switch (format) {
        case "uppercase":
          uuid = uuid.toUpperCase();
          break;
        case "lowercase":
          uuid = uuid.toLowerCase();
          break;
        case "nodashes":
          uuid = uuid.replace(/-/g, "");
          break;
        case "brackets":
          uuid = `{${uuid}}`;
          break;
        default:
          // standard format, no changes needed
          break;
      }

      newUuids.push(uuid);
    }

    setUuids(newUuids);
  }, [version, count, format]);

  const handleReset = () => {
    setUuids([]);
    setVersion(DEFAULT_UUID_GENERATOR_VERSION as 1 | 4);
    setCount(DEFAULT_UUID_GENERATOR_COUNT);
    setFormat(
      DEFAULT_UUID_GENERATOR_FORMAT as
        | "standard"
        | "uppercase"
        | "lowercase"
        | "nodashes"
        | "brackets"
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const copyAllToClipboard = async () => {
    const allUuids = uuids.join("\n");
    await copyToClipboard(allUuids);
  };

  useEffect(() => {
    generateUUID();
  }, [generateUUID]);

  const getFormatDescription = (fmt: string) => {
    switch (fmt) {
      case "standard":
        return "Standard format with hyphens";
      case "uppercase":
        return "Uppercase letters";
      case "lowercase":
        return "Lowercase letters";
      case "nodashes":
        return "No hyphens/dashes";
      case "brackets":
        return "Wrapped in curly brackets";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              UUID Generator
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Generate UUIDs (v1, v4) for unique identifiers
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generation Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="version">UUID Version</Label>
              <Select
                value={version.toString()}
                onValueChange={value => setVersion(parseInt(value) as 1 | 4)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">Version 4 (Random)</SelectItem>
                  <SelectItem value="1">Version 1 (Timestamp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="count">Count</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={e =>
                  setCount(
                    Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                  )
                }
                data-testid="count-input"
              />
            </div>

            <div>
              <Label htmlFor="format">Format</Label>
              <Select
                value={format}
                onValueChange={(value: typeof format) => setFormat(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="uppercase">Uppercase</SelectItem>
                  <SelectItem value="lowercase">Lowercase</SelectItem>
                  <SelectItem value="nodashes">No Dashes</SelectItem>
                  <SelectItem value="brackets">With Brackets</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                onClick={generateUUID}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate UUIDs
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Version {version}</Badge>
              <Badge variant="outline">{getFormatDescription(format)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {uuids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated UUIDs
              <div className="flex gap-2">
                <Badge variant="outline">
                  {uuids.length} UUID{uuids.length > 1 ? "s" : ""}
                </Badge>
                <Button
                  onClick={copyAllToClipboard}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uuids.map((uuid, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                >
                  <div className="font-mono text-sm flex-1 break-all">
                    {uuid}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(uuid)}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {uuids.length > 1 && (
              <div className="mt-4">
                <Label className="text-sm font-medium">
                  All UUIDs (for copying):
                </Label>
                <Textarea
                  value={uuids.join("\n")}
                  readOnly={true}
                  className="mt-2 min-h-[100px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
                  data-testid="all-uuids-output"
                  rows={5}
                  showLineNumbers={true}
                  showStats={true}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          UUID Information:
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>
            <strong>Version 1:</strong> Timestamp-based, includes MAC address
            (or random node)
          </div>
          <div>
            <strong>Version 4:</strong> Randomly generated, most commonly used
          </div>
          <div>
            <strong>Format:</strong> 8-4-4-4-12 hexadecimal digits (32 total)
          </div>
          <div>
            <strong>Use cases:</strong> Database keys, session IDs, file names,
            API tokens
          </div>
        </div>
      </div>
    </div>
  );
}
