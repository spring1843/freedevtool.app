import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, RefreshCw, Hash, Info, RotateCcw } from "lucide-react";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import { useToolDefault } from "@/hooks/use-tool-default";
import AdSlot from "@/components/ui/ad-slot";

interface UUIDOptions {
  version: 1 | 4;
  count: number;
  format: 'standard' | 'uppercase' | 'lowercase' | 'nodashes' | 'brackets';
}

const defaultFields = {
  uuids: [] as string[],
  version: 4 as 1 | 4,
  count: 1,
  format: 'standard' as 'standard' | 'uppercase' | 'lowercase' | 'nodashes' | 'brackets'
};

export default function UUIDGenerator() {
  const { fields, updateField, resetFields } = usePersistentForm('uuid-generator', defaultFields);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate UUID v4 (random)
  const generateUUIDv4 = (): string => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

  // Generate UUID v1 (timestamp-based)
  const generateUUIDv1 = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(16).substr(2, 8);
    
    // Simplified v1 UUID generation (not fully compliant but demonstrates concept)
    const timestampHex = timestamp.toString(16).padStart(12, '0');
    const timeLow = timestampHex.substr(-8);
    const timeMid = timestampHex.substr(-12, 4);
    const timeHi = `1${  timestampHex.substr(-15, 3)}`; // Version 1
    
    const clockSeq = (Math.random() * 0x3fff | 0x8000).toString(16);
    const node = random.padStart(12, '0');
    
    return `${timeLow}-${timeMid}-${timeHi}-${clockSeq.substr(0, 4)}-${node}`;
  };

  const formatUUID = (uuid: string, format: string): string => {
    const cleanUUID = uuid.replace(/-/g, '');
    
    switch (format) {
      case 'uppercase':
        return uuid.toUpperCase();
      case 'lowercase':
        return uuid.toLowerCase();
      case 'nodashes':
        return cleanUUID.toLowerCase();
      case 'brackets':
        return `{${uuid.toLowerCase()}}`;
      default:
        return uuid.toLowerCase();
    }
  };

  const generateUUIDs = () => {
    const newUUIDs = [];
    for (let i = 0; i < fields.count; i++) {
      const rawUUID = fields.version === 1 ? generateUUIDv1() : generateUUIDv4();
      const formattedUUID = formatUUID(rawUUID, fields.format);
      newUUIDs.push(formattedUUID);
    }
    updateField('uuids', newUUIDs);
  };

  // Generate UUIDs with default settings on component mount
  useToolDefault(() => {
    generateUUIDs();
  });

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const copyAllUUIDs = async () => {
    try {
      const allUUIDs = fields.uuids.join('\n');
      await navigator.clipboard.writeText(allUUIDs);
      setCopiedIndex(-1); // Special index for "copy all"
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const getVersionDescription = (version: number) => {
    switch (version) {
      case 1:
        return "Time-based UUID with MAC address and timestamp";
      case 4:
        return "Random UUID (most common and recommended)";
      default:
        return "";
    }
  };

  const getFormatDescription = (format: string) => {
    const sample = "550e8400-e29b-41d4-a716-446655440000";
    switch (format) {
      case 'standard':
        return sample;
      case 'uppercase':
        return sample.toUpperCase();
      case 'lowercase':
        return sample.toLowerCase();
      case 'nodashes':
        return sample.replace(/-/g, '');
      case 'brackets':
        return `{${sample}}`;
      default:
        return sample;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="UUID-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          UUID Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Generate universally unique identifiers (UUIDs) in various formats and versions
        </p>
      </div>

      {/* Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            UUID Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* UUID Version */}
            <div className="space-y-2">
              <Label htmlFor="uuid-version">UUID Version</Label>
              <Select
                value={fields.version.toString()}
                onValueChange={(value) => updateField('version', parseInt(value, 10) as 1 | 4)}
              >
                <SelectTrigger id="uuid-version" data-testid="uuid-version-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Version 1 (Time-based)</SelectItem>
                  <SelectItem value="4">Version 4 (Random)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {getVersionDescription(fields.version)}
              </p>
            </div>

            {/* Number of UUIDs */}
            <div className="space-y-2">
              <Label htmlFor="uuid-count">Number of UUIDs (1-100)</Label>
              <Input
                id="uuid-count"
                type="number"
                min="1"
                max="100"
                value={fields.count}
                onChange={(e) => updateField('count', Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                data-testid="uuid-count-input"
              />
            </div>

            {/* Format */}
            <div className="space-y-2">
              <Label htmlFor="uuid-format">Format</Label>
              <Select
                value={fields.format}
                onValueChange={(value) => updateField('format', value as UUIDOptions['format'])}
              >
                <SelectTrigger id="uuid-format" data-testid="uuid-format-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (lowercase with dashes)</SelectItem>
                  <SelectItem value="uppercase">Uppercase with dashes</SelectItem>
                  <SelectItem value="lowercase">Lowercase with dashes</SelectItem>
                  <SelectItem value="nodashes">No dashes</SelectItem>
                  <SelectItem value="brackets">With curly brackets</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 font-mono">
                {getFormatDescription(fields.format)}
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4 flex gap-2">
            <Button
              onClick={generateUUIDs}
              className="flex-1"
              data-testid="generate-uuids-button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate {fields.count === 1 ? 'UUID' : `${fields.count} UUIDs`}
            </Button>
            <Button
              onClick={resetFields}
              variant="outline"
              data-testid="reset-button"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="UUID-002" size="medium" />
      </div>

      {/* Generated UUIDs */}
      {fields.uuids.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated UUIDs</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-normal text-slate-500">
                  {fields.uuids.length} UUID{fields.uuids.length !== 1 ? 's' : ''}
                </span>
                {fields.uuids.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyAllUUIDs}
                    data-testid="copy-all-uuids"
                  >
                    {copiedIndex === -1 ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy All
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fields.uuids.map((uuid, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border"
                  data-testid={`uuid-item-${index}`}
                >
                  <div className="flex-1 mr-4">
                    <div className="font-mono text-sm break-all">
                      {uuid}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      UUID v{fields.version} • {fields.format} format
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(uuid, index)}
                    data-testid={`copy-uuid-${index}`}
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Panel */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="w-5 h-5 mr-2" />
            About UUIDs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">UUID Version 1 (Time-based)</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Based on timestamp and MAC address</li>
                <li>• Guaranteed uniqueness across systems</li>
                <li>• Can reveal time and location information</li>
                <li>• Best for distributed systems needing coordination</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">UUID Version 4 (Random)</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Generated using random or pseudo-random numbers</li>
                <li>• Most commonly used version</li>
                <li>• Privacy-friendly (no system info embedded)</li>
                <li>• Suitable for most applications</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-medium mb-2">Use Cases</h4>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Database Keys:</strong> Primary keys in databases, especially in distributed systems<br/>
              <strong>Session IDs:</strong> Unique session identifiers for web applications<br/>
              <strong>Transaction IDs:</strong> Tracking unique transactions across systems<br/>
              <strong>File Names:</strong> Creating unique file names to avoid conflicts<br/>
              <strong>API Keys:</strong> Generating unique identifiers for API authentication
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <AdSlot position="bottom" id="UUID-003" size="large" />
    </div>
  );
}