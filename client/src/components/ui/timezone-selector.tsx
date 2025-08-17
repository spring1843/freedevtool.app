import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { allTimezones, getUserTimezone } from "@/lib/time-tools";

interface WorldClockCity {
  name: string;
  country: string;
  timezone: string;
}

interface TimezoneSelectorProps {
  value?: string;
  onValueChange: (timezone: string) => void;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

export function TimezoneSelector({
  value,
  onValueChange,
  placeholder = `Select timezone... (Current: ${getUserTimezone()})`,
  className,
  "data-testid": testId,
}: TimezoneSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Get timezone offset for display
  const getTimezoneOffset = (timezone: string): string => {
    try {
      const now = new Date();
      const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
      const target = new Date(
        now.toLocaleString("en-US", { timeZone: timezone })
      );
      const offsetMinutes = (target.getTime() - utc.getTime()) / 60000;
      const offsetHours = offsetMinutes / 60;
      const sign = offsetHours >= 0 ? "+" : "";
      return `UTC${sign}${offsetHours.toFixed(offsetHours % 1 === 0 ? 0 : 1)}`;
    } catch {
      return "UTC+0";
    }
  };

  // Filter and sort timezones
  const filteredTimezones = useMemo(() => {
    const filtered = allTimezones.filter(
      (city: WorldClockCity) =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.timezone.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by timezone offset, then by city name
    return filtered.sort((a: WorldClockCity, b: WorldClockCity) => {
      const offsetA = getTimezoneOffset(a.timezone);
      const offsetB = getTimezoneOffset(b.timezone);

      // Extract numeric offset for proper sorting
      const numericOffsetA = parseFloat(offsetA.replace(/[^\d.-]/g, "")) || 0;
      const numericOffsetB = parseFloat(offsetB.replace(/[^\d.-]/g, "")) || 0;

      if (numericOffsetA !== numericOffsetB) {
        return numericOffsetA - numericOffsetB;
      }

      return a.name.localeCompare(b.name);
    });
  }, [searchTerm]);

  return (
    <Select value={value} onValueChange={onValueChange} data-testid={testId}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {/* Search Input */}
        <div className="flex items-center px-3 pb-2 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-4 h-4 mr-2 text-slate-400" />
          <Input
            placeholder="Search timezones..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border-0 px-0 focus-visible:ring-0"
          />
        </div>

        {/* Timezone Options */}
        {filteredTimezones.map((city: WorldClockCity) => {
          const offset = getTimezoneOffset(city.timezone);
          return (
            <SelectItem key={city.timezone} value={city.timezone}>
              <div className="flex justify-between items-center w-full min-w-0">
                <span className="font-medium truncate">
                  {city.name}, {city.country}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">
                  {offset}
                </span>
              </div>
            </SelectItem>
          );
        })}

        {filteredTimezones.length === 0 && (
          <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
            No timezones found matching &ldquo;{searchTerm}&rdquo;
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
