import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimezoneSelector } from "@/components/ui/timezone-selector";
import { getUserTimezone } from "@/lib/time-tools";
import { Clock, Copy, Check, RefreshCw } from "lucide-react";

interface TimeFormat {
  name: string;
  value: string;
  description: string;
}

export default function TimeFormatter() {
  const [inputTime, setInputTime] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [inputTimezone, setInputTimezone] = useState(getUserTimezone());
  const [formats, setFormats] = useState<TimeFormat[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Set current date and time on load
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0];
    setInputDate(dateStr);
    setInputTime(timeStr);
  }, []);

  // Format time whenever input changes
  useEffect(() => {
    if (inputDate && inputTime) {
      formatTime();
    }
  }, [inputDate, inputTime, inputTimezone, formatTime]);

  const formatTime = useCallback(() => {
    try {
      // Create date object from input
      const dateTime = new Date(`${inputDate}T${inputTime}`);

      if (isNaN(dateTime.getTime())) {
        throw new Error("Invalid date/time");
      }

      const timeFormats: TimeFormat[] = [
        {
          name: "24-Hour Format (HH:MM:SS)",
          value: dateTime.toLocaleTimeString("en-GB", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: inputTimezone,
          }),
          description: "Standard 24-hour military time format",
        },
        {
          name: "12-Hour Format (h:MM:SS AM/PM)",
          value: dateTime.toLocaleTimeString("en-US", {
            hour12: true,
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            timeZone: inputTimezone,
          }),
          description: "Standard 12-hour format with AM/PM",
        },
        {
          name: "ISO 8601 Time (HH:MM:SSZ)",
          value: dateTime.toISOString().split("T")[1],
          description: "International standard time format with UTC",
        },
        {
          name: "RFC 3339 DateTime",
          value: dateTime.toISOString(),
          description: "Internet date/time format based on ISO 8601",
        },
        {
          name: "Unix Timestamp",
          value: Math.floor(dateTime.getTime() / 1000).toString(),
          description: "Seconds since January 1, 1970 UTC",
        },
        {
          name: "Unix Timestamp (Milliseconds)",
          value: dateTime.getTime().toString(),
          description: "Milliseconds since January 1, 1970 UTC",
        },
        {
          name: "UTC Time",
          value: dateTime.toUTCString().split(" ")[4],
          description: "Time in Coordinated Universal Time",
        },
        {
          name: "Local Time (Long)",
          value: dateTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "long",
            timeZone: inputTimezone,
          }),
          description: "Local time with full timezone name",
        },
        {
          name: "Local Time (Short)",
          value: dateTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
            timeZone: inputTimezone,
          }),
          description: "Local time with abbreviated timezone",
        },
        {
          name: "Time Only (No Seconds)",
          value: dateTime.toLocaleTimeString("en-GB", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            timeZone: inputTimezone,
          }),
          description: "24-hour format without seconds",
        },
        {
          name: "12-Hour (No Seconds)",
          value: dateTime.toLocaleTimeString("en-US", {
            hour12: true,
            hour: "numeric",
            minute: "2-digit",
            timeZone: inputTimezone,
          }),
          description: "12-hour format without seconds",
        },
        {
          name: "Microseconds Format",
          value: `${dateTime.toLocaleTimeString("en-GB", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: inputTimezone,
          })}.${dateTime.getMilliseconds().toString().padStart(3, "0")}000`,
          description: "Time with microsecond precision",
        },
        {
          name: "Time with Offset",
          value: `${
            new Intl.DateTimeFormat("en", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZoneName: "longOffset",
              timeZone: inputTimezone,
            })
              .format(dateTime)
              .split(" ")[1]
          } ${new Intl.DateTimeFormat("en", {
            timeZoneName: "longOffset",
            timeZone: inputTimezone,
          })
            .format(dateTime)
            .split(" ")
            .pop()}`,
          description: "Time with timezone offset (±HH:MM)",
        },
        {
          name: "Decimal Time",
          value: convertToDecimalTime(dateTime),
          description: "French Revolutionary decimal time format",
        },
        {
          name: "Internet Time (.beats)",
          value: convertToInternetTime(dateTime),
          description: "Swatch Internet Time (BMT - Biel Mean Time)",
        },
        {
          name: "Julian Day Number",
          value: calculateJulianDay(dateTime).toFixed(6),
          description:
            "Days since January 1, 4713 BCE proleptic Julian calendar",
        },
        {
          name: "Modified Julian Day",
          value: (calculateJulianDay(dateTime) - 2400000.5).toFixed(6),
          description: "Modified Julian Day (MJD) for astronomical use",
        },
        {
          name: "Excel Serial Date",
          value: convertToExcelDate(dateTime).toFixed(6),
          description: "Excel date serial number format",
        },
      ];

      setFormats(timeFormats);
    } catch {
      console.error("Time formatting error");
      setFormats([]);
    }
  }, [inputDate, inputTime, inputTimezone]);

  const convertToDecimalTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const decimalTime = (totalSeconds / 86400) * 100000;
    const decimalHours = Math.floor(decimalTime / 10000);
    const decimalMinutes = Math.floor((decimalTime % 10000) / 100);
    const decimalSeconds = Math.floor(decimalTime % 100);
    return `${decimalHours}:${decimalMinutes.toString().padStart(2, "0")}:${decimalSeconds.toString().padStart(2, "0")}`;
  };

  const convertToInternetTime = (date: Date): string => {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const bmt = new Date(utc + 1 * 3600000); // BMT is UTC+1
    const totalSeconds =
      bmt.getHours() * 3600 + bmt.getMinutes() * 60 + bmt.getSeconds();
    const beats = Math.floor(totalSeconds / 86.4);
    return `@${beats.toString().padStart(3, "0")}`;
  };

  const calculateJulianDay = (date: Date): number => {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = date.getMonth() + 1 + 12 * a - 3;
    const jdn =
      date.getDate() +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;
    const dayFraction =
      (date.getHours() - 12) / 24 +
      date.getMinutes() / 1440 +
      date.getSeconds() / 86400;
    return jdn + dayFraction;
  };

  const convertToExcelDate = (date: Date): number => {
    const epoch = new Date(1899, 11, 30); // Excel's epoch (December 30, 1899)
    const diffTime = date.getTime() - epoch.getTime();
    return diffTime / (1000 * 60 * 60 * 24);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const setCurrentDateTime = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0];
    setInputDate(dateStr);
    setInputTime(timeStr);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Time Formatter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Format time to all existing time standards and formats
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Input Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="input-date">Date</Label>
              <Input
                id="input-date"
                type="date"
                value={inputDate}
                onChange={e => setInputDate(e.target.value)}
                data-testid="input-date"
              />
            </div>
            <div>
              <Label htmlFor="input-time">Time</Label>
              <Input
                id="input-time"
                type="time"
                step="1"
                value={inputTime}
                onChange={e => setInputTime(e.target.value)}
                data-testid="input-time"
              />
            </div>
            <div>
              <Label htmlFor="input-timezone">Timezone</Label>
              <TimezoneSelector
                value={inputTimezone}
                onValueChange={setInputTimezone}
                placeholder="Select timezone..."
                data-testid="input-timezone-select"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={setCurrentDateTime}
                variant="outline"
                className="w-full"
                data-testid="set-current-button"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formatted Times */}
      {formats.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Formatted Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formats.map((format, index) => (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50"
                  data-testid={`format-${index}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {format.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {format.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(format.value, index)}
                      data-testid={`copy-${index}`}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="font-mono text-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 p-3 rounded border">
                    {format.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Time Formatter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Standard Formats:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• 24-hour and 12-hour formats</li>
                <li>• ISO 8601 and RFC 3339 standards</li>
                <li>• Unix timestamps (seconds/milliseconds)</li>
                <li>• UTC and local time representations</li>
                <li>• Timezone-aware formatting</li>
                <li>• Microsecond precision support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Special Formats:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• French Revolutionary decimal time</li>
                <li>• Swatch Internet Time (.beats)</li>
                <li>• Julian Day Numbers (astronomical)</li>
                <li>• Modified Julian Day (MJD)</li>
                <li>• Excel serial date format</li>
                <li>• Custom timezone offsets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
