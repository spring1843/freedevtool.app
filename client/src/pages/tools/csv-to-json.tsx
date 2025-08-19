import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import {
  FileSpreadsheet,
  Code2,
  Upload,
  Share,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  updateURL,
  copyShareableURL,
  getValidatedParam,
} from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";

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
  const [csvInput, setCsvInput] = useState(`name,email,age,city
John Doe,john@example.com,30,New York
Jane Smith,jane@example.com,25,Los Angeles
Bob Johnson,bob@example.com,35,Chicago`);
  const [selectedDelimiter, setSelectedDelimiter] = useState(",");
  const [jsonOutput, setJsonOutput] = useState("");
  const [_parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [rowCount, setRowCount] = useState(0);

  const { toast } = useToast();

  // Load URL parameters on mount
  useEffect(() => {
    const urlCsv = getValidatedParam("csv", "", {
      type: "string",
      maxLength: 10000,
    });
    const urlDelimiter = getValidatedParam("delimiter", ",", {
      type: "enum",
      allowedValues: [",", ";", "\t", "|", " ", ":"],
    });

    if (urlCsv) {
      setCsvInput(decodeURIComponent(urlCsv as string));
    }
    setSelectedDelimiter(urlDelimiter as string);
  }, []);

  // Update URL when input changes
  useEffect(() => {
    updateURL({
      csv: encodeURIComponent(csvInput.slice(0, 500)),
      delimiter: selectedDelimiter,
    });
  }, [csvInput, selectedDelimiter]);

  // Parse CSV when input changes
  useEffect(() => {
    convertCSV();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvInput, selectedDelimiter]);

  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }

    result.push(current.trim());
    return result;
  };

  const convertCSV = () => {
    try {
      setError("");

      if (!csvInput.trim()) {
        setParsedData([]);
        setJsonOutput("");
        setHeaders([]);
        setRowCount(0);
        return;
      }

      const lines = csvInput
        .trim()
        .split("\n")
        .filter((line: string) => line.trim());

      if (lines.length === 0) {
        throw new Error("No data found");
      }

      // Parse headers
      const headerLine = lines[0];
      const parsedHeaders = parseCSVLine(headerLine, selectedDelimiter)
        .map(header => header.replace(/^["']|["']$/g, "").trim())
        .filter(header => header.length > 0);

      if (parsedHeaders.length === 0) {
        throw new Error("No headers found in the first line");
      }

      setHeaders(parsedHeaders);

      // Parse data rows
      const dataRows: CSVRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line, selectedDelimiter);
        const row: CSVRow = {};

        parsedHeaders.forEach((header, index) => {
          const value = values[index] || "";
          row[header] = value.replace(/^["']|["']$/g, "").trim();
        });

        dataRows.push(row);
      }

      setParsedData(dataRows);
      setRowCount(dataRows.length);
      setJsonOutput(JSON.stringify(dataRows, null, 2));
    } catch {
      const errorMessage = "Failed to parse CSV";
      setError(errorMessage);
      setParsedData([]);
      setJsonOutput("");
      setHeaders([]);
      setRowCount(0);
    }
  };

  const shareConverter = async () => {
    const success = await copyShareableURL({
      csv: encodeURIComponent(csvInput.slice(0, 500)),
      delimiter: selectedDelimiter,
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

  const loadSampleData = (type: "simple" | "complex" | "semicolon" | "tab") => {
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

    setCsvInput(samples[type]);

    if (type === "semicolon") {
      setSelectedDelimiter(";");
    } else if (type === "tab") {
      setSelectedDelimiter("\t");
    } else {
      setSelectedDelimiter(",");
    }
  };

  const clearAll = () => {
    setCsvInput("");
    setParsedData([]);
    setJsonOutput("");
    setHeaders([]);
    setRowCount(0);
    setError("");
  };

  const downloadJSON = () => {
    if (!jsonOutput) return;

    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setCsvInput(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileSpreadsheet className="h-8 w-8 text-blue-600" />
          CSV to JSON Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert CSV data to JSON format with customizable delimiters and
          formatting options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              CSV Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <Label htmlFor="delimiter-select">Delimiter:</Label>
              <Select
                value={selectedDelimiter}
                onValueChange={setSelectedDelimiter}
                data-testid="delimiter-select"
              >
                <SelectTrigger className="w-48">
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

              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={clearAll}
                  variant="outline"
                  size="sm"
                  data-testid="clear-button"
                >
                  Clear
                </Button>
                <Button
                  onClick={() => document.getElementById("file-input")?.click()}
                  variant="outline"
                  size="sm"
                  data-testid="upload-file-button"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            <Textarea
              value={csvInput}
              onChange={e => setCsvInput(e.target.value)}
              placeholder="name,email,age
John Doe,john@example.com,30
Jane Smith,jane@example.com,25"
              className="min-h-[200px] font-mono text-sm"
              data-testid="csv-input"
              rows={10}
            />

            {error ? (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            ) : null}

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
                onClick={() => loadSampleData("simple")}
                variant="outline"
                size="sm"
                data-testid="load-simple-button"
              >
                Simple CSV
              </Button>
              <Button
                onClick={() => loadSampleData("complex")}
                variant="outline"
                size="sm"
                data-testid="load-complex-button"
              >
                Complex CSV
              </Button>
              <Button
                onClick={() => loadSampleData("semicolon")}
                variant="outline"
                size="sm"
                data-testid="load-semicolon-button"
              >
                Semicolon CSV
              </Button>
              <Button
                onClick={() => loadSampleData("tab")}
                variant="outline"
                size="sm"
                data-testid="load-tab-button"
              >
                Tab Delimited
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              JSON Output
              {rowCount > 0 && (
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  ({rowCount} rows)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <CopyButton
                text={jsonOutput}
                className="flex-1"
                data-testid="copy-json-button"
              />
              <Button
                onClick={downloadJSON}
                variant="outline"
                disabled={!jsonOutput}
                data-testid="download-json-button"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <Textarea
              value={jsonOutput}
              readOnly
              placeholder="JSON output will appear here..."
              className="min-h-[200px] font-mono text-sm"
              data-testid="json-output"
              rows={10}
            />

            {headers.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                  Detected Headers ({headers.length}):
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {headers.join(", ")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
