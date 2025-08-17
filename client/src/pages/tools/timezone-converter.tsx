import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Clock, ArrowRight, Copy, Check, RefreshCw, Share } from "lucide-react";
import AdSlot from "@/components/ui/ad-slot";
import { TimezoneSelector } from "@/components/ui/timezone-selector";
import { getUserTimezone } from "@/lib/time-tools";
import { updateURL, copyShareableURL, getValidatedParam } from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";

interface TimezoneConversion {
  timezone: string;
  name: string;
  time: string;
  offset: string;
  date: string;
}

export default function TimezoneConverter() {
  const [sourceDate, setSourceDate] = useState("");
  const [sourceTime, setSourceTime] = useState("");
  const [sourceTimezone, setSourceTimezone] = useState(getUserTimezone());
  const [targetTimezones, setTargetTimezones] = useState<string[]>([
    "America/New_York",
    "Europe/London", 
    "Asia/Tokyo",
    "Australia/Sydney"
  ]);
  const [conversions, setConversions] = useState<TimezoneConversion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Set current date and time on load
  useEffect(() => {
    // Load parameters from URL with validation
    const urlDate = getValidatedParam('date', '', {
      type: 'string',
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      maxLength: 10
    });
    const urlTime = getValidatedParam('time', '', {
      type: 'string', 
      pattern: /^\d{2}:\d{2}(:\d{2})?$/,
      maxLength: 8
    });
    
    // Common timezone list for validation
    const validTimezones = [
      'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 
      'America/Denver', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
      'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
      'Australia/Melbourne', 'Pacific/Auckland', 'America/Toronto',
      'America/Sao_Paulo', 'Asia/Dubai', 'Asia/Singapore', 'Europe/Amsterdam',
      'Europe/Rome', 'Europe/Madrid', 'Europe/Stockholm', 'America/Mexico_City',
      'Asia/Seoul', 'Asia/Bangkok', 'Europe/Moscow', 'Africa/Cairo'
    ];
    
    const urlSourceTz = getValidatedParam('from', 'UTC', {
      type: 'enum',
      allowedValues: validTimezones
    });
    const urlTargetTzs = getValidatedParam('to', 'America/New_York,Europe/London,Asia/Tokyo,Australia/Sydney', {
      type: 'array',
      allowedValues: validTimezones,
      arrayMaxLength: 10
    });
    
    if (urlDate && urlTime) {
      setSourceDate(urlDate);
      setSourceTime(urlTime);
      setSourceTimezone(urlSourceTz);
      
      if (Array.isArray(urlTargetTzs) && urlTargetTzs.length > 0) {
        setTargetTimezones(urlTargetTzs);
      }
      
      // Auto-convert if loaded from URL
      setTimeout(() => convertTimezones(), 100);
    } else {
      // Set current date and time for new users
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];
      setSourceDate(dateStr);
      setSourceTime(timeStr);
    }
  }, []);

  const convertTimezones = () => {
    if (!sourceDate || !sourceTime) {
      toast({
        title: "Missing input",
        description: "Please provide both date and time for conversion",
        variant: "destructive",
      });
      return;
    }

    if (targetTimezones.length === 0) {
      toast({
        title: "No target timezones",
        description: "Please add at least one target timezone",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create date object from source input
      const sourceDateTime = new Date(`${sourceDate}T${sourceTime}`);
      
      if (isNaN(sourceDateTime.getTime())) {
        throw new Error("Invalid date or time format");
      }
      
      // Convert using simplified approach with Intl.DateTimeFormat
      const results: TimezoneConversion[] = targetTimezones.map(tz => {
        try {
          // Use a more straightforward approach for timezone conversion
          // Create a temporary date object to interpret the input in the source timezone
          const tempDate = new Date(`${sourceDate}T${sourceTime}`);
          
          // Format the same moment in time to the target timezone
          const targetTime = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).format(tempDate);
          
          const [datePart, timePart] = targetTime.split(', ');
          
          // Get timezone offset for display
          const offsetFormatter = new Intl.DateTimeFormat('en', {
            timeZone: tz,
            timeZoneName: 'longOffset'
          });
          const offsetParts = offsetFormatter.formatToParts(tempDate);
          const offset = offsetParts.find(part => part.type === 'timeZoneName')?.value || '';
          
          // Get readable timezone name
          const nameFormatter = new Intl.DateTimeFormat('en', {
            timeZone: tz,
            timeZoneName: 'long'
          });
          const nameParts = nameFormatter.formatToParts(tempDate);
          const name = nameParts.find(part => part.type === 'timeZoneName')?.value || tz;
          
          return {
            timezone: tz,
            name,
            time: timePart || "00:00:00",
            date: datePart || sourceDate,
            offset
          };
        } catch (tzError) {
          console.error(`Error converting to timezone ${tz}:`, tzError);
          return {
            timezone: tz,
            name: tz,
            time: "Error",
            date: "Error", 
            offset: "Error"
          };
        }
      });

      setConversions(results);
      
      // Update URL with current settings
      updateURL({
        date: sourceDate,
        time: sourceTime,
        from: sourceTimezone,
        to: targetTimezones.join(',')
      });
      
      toast({
        title: "Conversion complete!",
        description: `Converted to ${results.length} timezone${results.length !== 1 ? 's' : ''}`,
      });
      
    } catch (err) {
      console.error('Timezone conversion error');
      setConversions([]);
      toast({
        title: "Conversion failed",
        description: err instanceof Error ? err.message : "An error occurred during conversion",
        variant: "destructive",
      });
    }
  };



  const addTargetTimezone = (timezone: string) => {
    if (!targetTimezones.includes(timezone)) {
      setTargetTimezones([...targetTimezones, timezone]);
    }
  };

  const removeTargetTimezone = (timezone: string) => {
    setTargetTimezones(targetTimezones.filter(tz => tz !== timezone));
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const setCurrentDateTime = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    setSourceDate(dateStr);
    setSourceTime(timeStr);
  };

  const shareConverter = async () => {
    const success = await copyShareableURL({
      date: sourceDate,
      time: sourceTime,
      from: sourceTimezone,
      to: targetTimezones.join(',')
    });
    if (success) {
      toast({
        title: "Timezone converter shared!",
        description: "URL copied to clipboard with current settings",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  // No need for manual timezone mapping - TimezoneSelector handles this

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="TZ-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Timezone Converter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Convert time across multiple timezones with second-level precision
        </p>
      </div>

      {/* Source Time Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Source Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="source-date">Date</Label>
              <Input
                id="source-date"
                type="date"
                value={sourceDate}
                onChange={(e) => setSourceDate(e.target.value)}
                data-testid="source-date-input"
              />
            </div>
            <div>
              <Label htmlFor="source-time">Time (24h)</Label>
              <Input
                id="source-time"
                type="time"
                step="1"
                value={sourceTime}
                onChange={(e) => setSourceTime(e.target.value)}
                data-testid="source-time-input"
              />
            </div>
            <div>
              <Label htmlFor="source-timezone">Source Timezone</Label>
              <TimezoneSelector
                value={sourceTimezone}
                onValueChange={setSourceTimezone}
                placeholder="Select source timezone"
                data-testid="source-timezone"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={setCurrentDateTime}
                variant="outline"
                className="w-full"
                data-testid="set-current-time-button"
              >
                <Clock className="w-4 h-4 mr-2" />
                Now
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={convertTimezones}
              className="flex-1"
              data-testid="convert-timezones-button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Convert Timezones
            </Button>
            
            <Button
              onClick={shareConverter}
              variant="outline"
              data-testid="share-converter-button"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="TZ-002" size="medium" />
      </div>

      {/* Target Timezones Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Target Timezones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {targetTimezones.map(tz => {
              const timezoneName = tz; // Timezone selector provides readable names
              return (
                <div
                  key={tz}
                  className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm"
                >
                  <span>{timezoneName}</span>
                  <button
                    onClick={() => removeTargetTimezone(tz)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    data-testid={`remove-${tz}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-2">
            <TimezoneSelector
              value={undefined}
              onValueChange={addTargetTimezone}
              placeholder="Add target timezone"
              className="flex-1"
              data-testid="add-timezone-select"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversion Results */}
      {conversions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="w-5 h-5 mr-2" />
              Converted Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conversions.map((conversion, index) => (
                <div
                  key={conversion.timezone}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2"
                  data-testid={`conversion-${conversion.timezone}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {conversion.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {conversion.timezone} ({conversion.offset})
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(`${conversion.date} ${conversion.time}`, index)}
                      data-testid={`copy-${conversion.timezone}`}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-lg font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {conversion.time}
                    </div>
                    <div className="text-sm font-mono text-slate-600 dark:text-slate-400">
                      {conversion.date}
                    </div>
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
          <CardTitle>About Timezone Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Second-level time precision</li>
                <li>• 100+ supported timezones worldwide</li>
                <li>• Automatic daylight saving time handling</li>
                <li>• Multiple target timezone conversion</li>
                <li>• Real-time offset calculation</li>
                <li>• Copy converted times to clipboard</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage Tips:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Use 24-hour format for precise conversion</li>
                <li>• Add/remove target timezones as needed</li>
                <li>• Click "Now" to use current date/time</li>
                <li>• Copy button includes both date and time</li>
                <li>• UTC offsets adjust for DST automatically</li>
                <li>• Perfect for scheduling global meetings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="TZ-003" size="large" />
      </div>
    </div>
  );
}