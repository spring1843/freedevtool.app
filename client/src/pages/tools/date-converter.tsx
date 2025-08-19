import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, RotateCcw, Clock, Copy } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";
import { useToast } from "@/hooks/use-toast";

interface DateFormat {
  name: string;
  value: string;
  description: string;
  category: string;
}

// 20 Essential Date Formats for Developers
const DATE_FORMATS = [
  // Unix & Timestamps
  {
    name: "Unix Timestamp",
    format: "unix",
    description: "Seconds since Jan 1, 1970",
    category: "Timestamp",
  },
  {
    name: "Unix Milliseconds",
    format: "unixms",
    description: "Milliseconds since Jan 1, 1970",
    category: "Timestamp",
  },

  // ISO Standards
  {
    name: "ISO 8601",
    format: "iso",
    description: "2024-01-15T14:30:45.123Z",
    category: "ISO Standards",
  },
  {
    name: "ISO Date Only",
    format: "isodate",
    description: "2024-01-15",
    category: "ISO Standards",
  },
  {
    name: "ISO Time Only",
    format: "isotime",
    description: "14:30:45.123Z",
    category: "ISO Standards",
  },

  // RFC Standards
  {
    name: "RFC 2822",
    format: "rfc2822",
    description: "Mon, 15 Jan 2024 14:30:45 GMT",
    category: "RFC Standards",
  },
  {
    name: "RFC 3339",
    format: "rfc3339",
    description: "2024-01-15T14:30:45.123Z",
    category: "RFC Standards",
  },

  // Common International
  {
    name: "US Format",
    format: "us",
    description: "01/15/2024",
    category: "Regional",
  },
  {
    name: "European Format",
    format: "eu",
    description: "15/01/2024",
    category: "Regional",
  },
  {
    name: "ISO Numeric",
    format: "numeric",
    description: "2024-01-15",
    category: "Regional",
  },

  // Developer Friendly
  {
    name: "SQL DateTime",
    format: "sql",
    description: "2024-01-15 14:30:45",
    category: "Database",
  },
  {
    name: "SQL Date",
    format: "sqldate",
    description: "2024-01-15",
    category: "Database",
  },
  {
    name: "MongoDB ObjectId",
    format: "objectid",
    description: "65a5c1d5f1a2b3c4d5e6f789",
    category: "Database",
  },

  // Human Readable
  {
    name: "Full Text",
    format: "full",
    description: "Monday, January 15, 2024",
    category: "Human Readable",
  },
  {
    name: "Short Text",
    format: "short",
    description: "Jan 15, 2024",
    category: "Human Readable",
  },
  {
    name: "Time 12-hour",
    format: "time12",
    description: "2:30:45 PM",
    category: "Human Readable",
  },
  {
    name: "Time 24-hour",
    format: "time24",
    description: "14:30:45",
    category: "Human Readable",
  },

  // Web/API
  {
    name: "HTTP Date",
    format: "http",
    description: "Mon, 15 Jan 2024 14:30:45 GMT",
    category: "Web/API",
  },
  {
    name: "JSON Date",
    format: "json",
    description: "2024-01-15T14:30:45.123Z",
    category: "Web/API",
  },
  {
    name: "Cookie Expires",
    format: "cookie",
    description: "Mon, 15-Jan-2024 14:30:45 GMT",
    category: "Web/API",
  },
];

export default function DateConverter() {
  const [inputDate, setInputDate] = useState("1699123456");
  const [formats, setFormats] = useState<DateFormat[]>([]);
  const { toast } = useToast();

  const parseInputDate = (input: string): Date | null => {
    // Try Unix timestamp (seconds)
    if (/^\d{10}$/.test(input)) {
      return new Date(parseInt(input) * 1000);
    }

    // Try Unix timestamp (milliseconds)
    if (/^\d{13}$/.test(input)) {
      return new Date(parseInt(input));
    }

    // Try standard date parsing
    const date = new Date(input);
    return isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (date: Date, format: string): string => {
    const pad = (n: number) => String(n).padStart(2, "0");

    switch (format) {
      case "unix":
        return Math.floor(date.getTime() / 1000).toString();
      case "unixms":
        return date.getTime().toString();
      case "iso":
        return date.toISOString();
      case "isodate":
        return date.toISOString().split("T")[0];
      case "isotime":
        return date.toISOString().split("T")[1];
      case "rfc2822":
        return date.toUTCString();
      case "rfc3339":
        return date.toISOString();
      case "us":
        return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
      case "eu":
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
      case "numeric":
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      case "sql":
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      case "sqldate":
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      case "objectid":
        const timestamp = Math.floor(date.getTime() / 1000).toString(16);
        return `${timestamp.padStart(8, "0")}f1a2b3c4d5e6f789`;
      case "full":
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "short":
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      case "time12":
        return date.toLocaleTimeString("en-US", { hour12: true });
      case "time24":
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      case "http":
        return date.toUTCString();
      case "json":
        return date.toISOString();
      case "cookie":
        return date.toUTCString().replace(/GMT/, "GMT");
      default:
        return date.toString();
    }
  };

  const convertDate = useCallback(() => {
    const date = parseInputDate(inputDate.trim());

    if (!date) {
      setFormats([
        {
          name: "Error",
          value: "Invalid date input",
          description:
            "Supported: Unix timestamps (seconds/milliseconds), ISO 8601, or any standard date format",
          category: "Error",
        },
      ]);
      return;
    }

    const newFormats = DATE_FORMATS.map(fmt => ({
      name: fmt.name,
      value: formatDate(date, fmt.format),
      description: fmt.description,
      category: fmt.category,
    }));

    setFormats(newFormats);
  }, [inputDate]);

  const handleReset = () => {
    setInputDate("1699123456");
    setFormats([]);
  };

  const handleCurrentTime = () => {
    const now = new Date();
    // Use the user's timezone for current time display
    setInputDate(Math.floor(now.getTime() / 1000).toString());
  };

  useEffect(() => {
    convertDate();
  }, [convertDate]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Date format copied to clipboard",
      });
    } catch (error: unknown) {
      toast({
        title: "Copy failed",
        description: `Could not copy to clipboard: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Date Converter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Convert between 20 essential date formats: Unix timestamps, ISO
              standards, RFC formats, regional formats, and database formats
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Input Date</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="input-date">Date Input</Label>
            <Input
              id="input-date"
              value={inputDate}
              onChange={e => setInputDate(e.target.value)}
              placeholder="Enter Unix timestamp, ISO date, or any standard date format..."
              data-testid="date-input"
              className="font-mono"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supports: Unix timestamps (seconds/milliseconds), ISO 8601, RFC
              formats, human-readable dates
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={convertDate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="convert-button"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Convert Date
            </Button>
            <Button onClick={handleCurrentTime} variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Use Current Time
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {formats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Converted Formats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Group formats by category */}
            {[
              "Timestamp",
              "ISO Standards",
              "RFC Standards",
              "Regional",
              "Database",
              "Human Readable",
              "Web/API",
            ].map(category => {
              const categoryFormats = formats.filter(
                f => f.category === category
              );
              if (categoryFormats.length === 0) return null;

              return (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-blue-600 dark:text-blue-400">
                    {category}
                  </h3>
                  <div className="grid gap-3">
                    {categoryFormats.map((format, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {format.name}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(format.value)}
                            className="text-xs h-6 px-2"
                            data-testid={`copy-${format.name.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2 break-all">
                          {format.value}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {format.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Show error formats if any */}
            {formats
              .filter(f => f.category === "Error")
              .map((format, index) => (
                <div
                  key={index}
                  className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20"
                >
                  <div className="text-red-600 dark:text-red-400 font-medium">
                    {format.name}
                  </div>
                  <div className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {format.value}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                    {format.description}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Input Examples Documentation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Input Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">
                Timestamp Formats
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    1699123456
                  </code>{" "}
                  - Unix timestamp (seconds)
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    1699123456000
                  </code>{" "}
                  - Unix milliseconds
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    2024-01-15T14:30:45Z
                  </code>{" "}
                  - ISO 8601
                </li>
                <li>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    Jan 15, 2024
                  </code>{" "}
                  - Human readable
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">
                Output Categories
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <strong>Timestamps:</strong> Unix seconds & milliseconds
                </li>
                <li>
                  <strong>ISO Standards:</strong> ISO 8601 full, date-only,
                  time-only
                </li>
                <li>
                  <strong>RFC Standards:</strong> RFC 2822, RFC 3339
                </li>
                <li>
                  <strong>Regional:</strong> US, European, ISO numeric formats
                </li>
                <li>
                  <strong>Database:</strong> SQL datetime, MongoDB ObjectId
                </li>
                <li>
                  <strong>Human Readable:</strong> Full text, short text, 12/24h
                  time
                </li>
                <li>
                  <strong>Web/API:</strong> HTTP headers, JSON, cookies
                </li>
              </ul>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
            <strong>Auto-detection:</strong> Simply paste any timestamp, ISO
            date, or human-readable date. The converter automatically detects
            the format and converts to all {DATE_FORMATS.length} essential
            formats.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
