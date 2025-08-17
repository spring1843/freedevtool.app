import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import { RefreshCw, Lightbulb, Share, RotateCcw } from "lucide-react";
import { updateURL, copyShareableURL, getValidatedParam } from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import type { DateFormat } from "@/types/tools";

const inputTypes = [
  { value: "unix", label: "Unix Timestamp" },
  { value: "iso", label: "ISO 8601" },
  { value: "rfc", label: "RFC 2822" },
  { value: "custom", label: "Custom Format" },
];



export default function DateConverter() {
  const { fields, updateField, resetFields } = usePersistentForm('date-converter', {
    inputType: "unix",
    inputDate: "1699123456",
    formats: [] as DateFormat[]
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load parameters from URL with validation
    const urlInputType = getValidatedParam('type', 'unix', {
      type: 'enum',
      allowedValues: ['unix', 'iso', 'rfc', 'custom']
    });
    const urlInputDate = getValidatedParam('date', '1699123456', {
      type: 'string',
      pattern: /^[\w\s\-:+T.Z,()]*$/, // Allow common date characters
      maxLength: 100
    });
    
    updateField('inputType', urlInputType);
    updateField('inputDate', urlInputDate);
  }, []);

  const convertDate = () => {
    try {
      let date: Date;
      
      if (fields.inputDate.toLowerCase() === 'now') {
        date = new Date();
      } else {
        switch (fields.inputType) {
          case "unix":
            const timestamp = parseInt(fields.inputDate);
            date = new Date(timestamp * (timestamp.toString().length <= 10 ? 1000 : 1));
            break;
          case "iso":
            date = new Date(fields.inputDate);
            break;
          case "rfc":
            date = new Date(fields.inputDate);
            break;
          default:
            date = new Date(fields.inputDate);
        }
      }

      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      const newFormats: DateFormat[] = [
        { name: "ISO 8601", value: date.toISOString() },
        { name: "RFC 2822", value: date.toUTCString() },
        { name: "Unix Timestamp", value: Math.floor(date.getTime() / 1000).toString() },
        { name: "Unix Timestamp (ms)", value: date.getTime().toString() },
        { name: "Human Readable", value: date.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit', 
          timeZoneName: 'short' 
        })},
        { name: "Relative", value: getRelativeTime(date) },
      ];

      updateField('formats', newFormats);
    } catch {
      console.error('Date conversion error');
      updateField('formats', []);
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return `${diffSec} second${diffSec > 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    convertDate();
    // Update URL when input changes
    updateURL({ type: fields.inputType, date: fields.inputDate });
  }, [fields.inputType, fields.inputDate]);

  const shareConverter = async () => {
    const success = await copyShareableURL({ type: fields.inputType, date: fields.inputDate });
    if (success) {
      toast({
        title: "Date Converter shared!",
        description: "URL copied to clipboard with current date and type settings",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Date Converter
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Convert between different date formats and timestamps
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="input-type">Input Type</Label>
                <Select value={fields.inputType} onValueChange={(value) => updateField('inputType', value)}>
                  <SelectTrigger data-testid="input-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {inputTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date-input">Date Input</Label>
                <Input
                  id="date-input"
                  value={fields.inputDate}
                  onChange={(e) => updateField('inputDate', e.target.value)}
                  placeholder="1699123456 or 'now'"
                  className="font-mono"
                  data-testid="date-input"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={convertDate} className="flex-1" data-testid="convert-button">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Convert
                </Button>
                
                <Button
                  onClick={shareConverter}
                  variant="outline"
                  data-testid="share-converter-button"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button onClick={resetFields} variant="outline" data-testid="reset-converter-button">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Output</CardTitle>
                <CopyButton 
                  text={fields.formats.map((f: DateFormat) => `${f.name}: ${f.value}`).join('\n')} 
                  variant="outline" 
                  size="sm"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.formats.map((format: DateFormat, index: number) => (
                <div 
                  key={index}
                  className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 bg-slate-50 dark:bg-slate-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {format.name}
                    </span>
                    <CopyButton text={format.value} />
                  </div>
                  <code className="text-sm font-mono text-slate-800 dark:text-slate-200 block break-all">
                    {format.value}
                  </code>
                </div>
              ))}
            </CardContent>
          </Card>


        </div>
      </div>

      {/* Pro Tips */}
      <div className="mt-8">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Lightbulb className="text-blue-600 dark:text-blue-400 mt-1 h-5 w-5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Pro Tips</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Use Ctrl+V to paste dates directly from clipboard</li>
                  <li>• Click on any output to copy it automatically</li>
                  <li>• Supports millisecond precision timestamps</li>
                  <li>• Use "now" to get current timestamp</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
