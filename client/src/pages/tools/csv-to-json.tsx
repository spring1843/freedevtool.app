import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import { FileSpreadsheet, Code2, Upload, Share, Download, RefreshCw } from "lucide-react";
import { updateURL, copyShareableURL, getValidatedParam } from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";
import { usePersistentForm } from "@/hooks/use-persistent-state";

interface CSVRow {
  [key: string]: string;
}

const delimiters = [
  { value: ",", label: "Comma (,)" },
  { value: ";", label: "Semicolon (;)" },
  { value: "\t", label: "Tab (\\t)" },
  { value: "|", label: "Pipe (|)" },
  { value: " ", label: "Space" },
  { value: ":", label: "Colon (:)" },
];

export default function CSVToJSON() {
  const { fields, updateField, resetFields } = usePersistentForm('csv-to-json', {
    csvInput: `name,email,age,city
John Doe,john@example.com,30,New York
Jane Smith,jane@example.com,25,Los Angeles
Bob Johnson,bob@example.com,35,Chicago`,
    selectedDelimiter: ",",
    jsonOutput: "",
    parsedData: [] as CSVRow[],
    headers: [] as string[],
    error: "",
    rowCount: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load parameters from URL with validation
    const urlCsv = getValidatedParam('csv', '', {
      type: 'string',
      maxLength: 10000 // Limit CSV size in URL
    });
    const urlDelimiter = getValidatedParam('delimiter', ',', {
      type: 'enum',
      allowedValues: [',', ';', '\t', '|', ' ', ':']
    });
    
    if (urlCsv) {
      updateField('csvInput', urlCsv);
    }
    updateField('selectedDelimiter', urlDelimiter);
  }, []);

  useEffect(() => {
    convertCSV();
    // Update URL when input changes
    updateURL({ 
      csv: encodeURIComponent(fields.csvInput.slice(0, 500)), // Limit URL length
      delimiter: fields.selectedDelimiter 
    });
  }, [fields.csvInput, fields.selectedDelimiter]);

  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quotes
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === delimiter && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  const convertCSV = () => {
    try {
      updateField('error', "");
      
      if (!fields.csvInput.trim()) {
        updateField('parsedData', []);
        updateField('jsonOutput', "");
        updateField('headers', []);
        updateField('rowCount', 0);
        return;
      }

      const lines = fields.csvInput.trim().split('\n').filter((line: string) => line.trim());
      
      if (lines.length === 0) {
        throw new Error("No data found");
      }

      // Parse headers from first line
      const headerLine = lines[0];
      const parsedHeaders = parseCSVLine(headerLine, fields.selectedDelimiter)
        .map(header => header.replace(/^["']|["']$/g, '').trim())
        .filter(header => header.length > 0);

      if (parsedHeaders.length === 0) {
        throw new Error("No headers found in the first line");
      }

      updateField('headers', parsedHeaders);

      // Parse data rows
      const dataRows: CSVRow[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line, fields.selectedDelimiter);
        const row: CSVRow = {};

        // Map values to headers
        parsedHeaders.forEach((header, index) => {
          const value = values[index] || '';
          row[header] = value.replace(/^["']|["']$/g, '').trim();
        });

        dataRows.push(row);
      }

      updateField('parsedData', dataRows);
      updateField('rowCount', dataRows.length);
      updateField('jsonOutput', JSON.stringify(dataRows, null, 2));

    } catch {
      const errorMessage = "Failed to parse CSV";
      updateField('error', errorMessage);
      updateField('parsedData', []);
      updateField('jsonOutput', "");
      updateField('headers', []);
      updateField('rowCount', 0);
    }
  };

  const shareConverter = async () => {
    const success = await copyShareableURL({ 
      csv: encodeURIComponent(fields.csvInput.slice(0, 500)),
      delimiter: fields.selectedDelimiter 
    });
    if (success) {
      toast({
        title: "CSV to JSON converter shared!",
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

  const loadSampleData = (type: 'simple' | 'complex' | 'semicolon' | 'tab') => {
    const samples = {
      simple: `name,email,age
John Doe,john@example.com,30
Jane Smith,jane@example.com,25`,
      complex: `"Product Name","Price (USD)","In Stock","Category","Description"
"Laptop Computer","999.99","true","Electronics","High-performance laptop with SSD"
"Coffee Mug","12.50","false","Kitchen","Ceramic mug, dishwasher safe"
"Book: ""Programming Guide""","29.95","true","Books","Comprehensive programming tutorial"`,
      semicolon: `name;email;age;city
John Doe;john@example.com;30;New York
Jane Smith;jane@example.com;25;Los Angeles`,
      tab: `name        email   age     department
John Doe        john@example.com        30      Engineering
Jane Smith      jane@example.com        25      Marketing`,
    };
    
    updateField('csvInput', samples[type]);
    
    if (type === 'semicolon') {
      updateField('selectedDelimiter', ';');
    } else if (type === 'tab') {
      updateField('selectedDelimiter', '\t');
    } else {
      updateField('selectedDelimiter', ',');
    }
  };



  const clearAll = () => {
    updateField('csvInput', "");
    updateField('parsedData', []);
    updateField('jsonOutput', "");
    updateField('headers', []);
    updateField('rowCount', 0);
    updateField('error', "");
  };

  const downloadJSON = () => {
    if (!fields.jsonOutput) return;
    
    const blob = new Blob([fields.jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      updateField('csvInput', content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="CTJ-001" size="large" className="mb-6" />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          CSV to JSON Converter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Convert CSV data to JSON format with automatic header detection and customizable delimiters
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                CSV Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="delimiter-select">Delimiter</Label>
                <Select value={fields.selectedDelimiter} onValueChange={(value) => updateField('selectedDelimiter', value)}>
                  <SelectTrigger data-testid="delimiter-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {delimiters.map(delimiter => (
                      <SelectItem key={delimiter.value} value={delimiter.value}>
                        {delimiter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="csv-input">CSV Data</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      data-testid="upload-file-button"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={fields.csvInput}
                  onChange={(e) => updateField('csvInput', e.target.value)}
                  placeholder="name,email,age
John Doe,john@example.com,30
Jane Smith,jane@example.com,25"
                  className="min-h-[200px] font-mono text-sm"
                  data-testid="csv-input"
                  rows={10}
                  showLineNumbers={true}
                  showStats={true}
                />
              </div>

              {fields.error ? <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">{fields.error}</p>
                </div> : null}

              <div className="flex gap-2">
                <Button 
                  onClick={convertCSV} 
                  className="flex-1" 
                  data-testid="convert-button"
                >
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
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => loadSampleData('simple')}
                  variant="outline"
                  size="sm"
                  data-testid="load-simple-button"
                >
                  Simple CSV
                </Button>
                <Button
                  onClick={() => loadSampleData('complex')}
                  variant="outline"
                  size="sm"
                  data-testid="load-complex-button"
                >
                  Complex CSV
                </Button>
                <Button
                  onClick={() => loadSampleData('semicolon')}
                  variant="outline"
                  size="sm"
                  data-testid="load-semicolon-button"
                >
                  Semicolon (;)
                </Button>
                <Button
                  onClick={() => loadSampleData('tab')}
                  variant="outline"
                  size="sm"
                  data-testid="load-tab-button"
                >
                  Tab Delimited
                </Button>
              </div>

              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="w-full"
                data-testid="clear-button"
              >
                Clear Input
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Code2 className="w-5 h-5 mr-2" />
                  JSON Output
                  {fields.rowCount > 0 && (
                    <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                      ({fields.rowCount} rows)
                    </span>
                  )}
                </CardTitle>
                {fields.jsonOutput ? <div className="flex gap-2">
                    <CopyButton 
                      text={fields.jsonOutput} 
                      variant="outline" 
                      size="sm"
                    />
                    <Button
                      onClick={downloadJSON}
                      variant="outline"
                      size="sm"
                      data-testid="download-json-button"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div> : null}
              </div>
            </CardHeader>
            <CardContent>
              {fields.jsonOutput ? (
                <div className="space-y-4">
                  {/* Headers Preview */}
                  {fields.headers.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                        Detected Headers ({fields.headers.length}):
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {fields.headers.map((header: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded"
                          >
                            {header}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* JSON Output */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50 max-h-[400px] overflow-auto">
                    <pre className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {fields.jsonOutput}
                    </pre>
                  </div>

                  {/* Data Preview Table */}
                  {fields.parsedData.length > 0 && (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Data Preview (First 5 rows)
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                              {fields.headers.map((header: string, index: number) => (
                                <th key={index} className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-600 last:border-r-0">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {fields.parsedData.slice(0, 5).map((row: CSVRow, rowIndex: number) => (
                              <tr key={rowIndex} className="border-t border-slate-200 dark:border-slate-600">
                                {fields.headers.map((header: string, colIndex: number) => (
                                  <td key={colIndex} className="px-3 py-2 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-600 last:border-r-0">
                                    {row[header] || ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {fields.parsedData.length > 5 && (
                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                          ... and {fields.parsedData.length - 5} more rows
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter CSV data above to see the JSON conversion</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="CTJ-002" size="medium" />
      </div>

      {/* Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About CSV to JSON Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Automatic header detection from first row</li>
                <li>• Multiple delimiter support (comma, semicolon, tab, etc.)</li>
                <li>• Proper handling of quoted fields and escaped quotes</li>
                <li>• Data preview table for verification</li>
                <li>• File upload support for CSV files</li>
                <li>• JSON download functionality</li>
                <li>• URL sharing with settings preservation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Supported Formats:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Standard CSV with comma delimiters</li>
                <li>• Semicolon-separated values (European format)</li>
                <li>• Tab-separated values (TSV)</li>
                <li>• Pipe-delimited files</li>
                <li>• Custom delimiter support</li>
                <li>• Quoted fields with embedded delimiters</li>
                <li>• Escaped quotes within quoted fields</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="font-semibold mb-2">Tips for Best Results:</h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li>• Ensure the first row contains column headers</li>
              <li>• Use quotes around fields containing delimiters or line breaks</li>
              <li>• Escape quotes within quoted fields by doubling them ("")</li>
              <li>• Choose the correct delimiter for your data format</li>
              <li>• Remove empty rows for cleaner JSON output</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="CTJ-003" size="large" />
      </div>
    </div>
  );
}