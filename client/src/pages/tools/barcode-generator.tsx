import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";
import AdSlot from "@/components/ui/ad-slot";
import { SecurityBanner } from "@/components/ui/security-banner";

export default function BarcodeGenerator() {
  const [text, setText] = useState("123456789012");
  const [format, setFormat] = useState("CODE128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const barcodeFormats = [
    { value: "CODE128", label: "CODE 128", description: "Most versatile, supports all ASCII" },
    { value: "CODE39", label: "CODE 39", description: "Alphanumeric, widely used" },
    { value: "EAN13", label: "EAN-13", description: "European Article Number, 13 digits" },
    { value: "EAN8", label: "EAN-8", description: "European Article Number, 8 digits" },
    { value: "UPC", label: "UPC-A", description: "Universal Product Code, 12 digits" },
    { value: "ITF14", label: "ITF-14", description: "Interleaved 2 of 5, 14 digits" },
    { value: "MSI", label: "MSI", description: "Modified Plessey, numeric only" },
    { value: "pharmacode", label: "Pharmacode", description: "Pharmaceutical, 3-131070" }
  ];

  const generateBarcode = () => {
    if (!canvasRef.current || !text.trim()) {
      setError("Text cannot be empty");
      return;
    }

    try {
      setError(null);
      
      const options = {
        format,
        width,
        height,
        displayValue,
        fontSize: 16,
        textAlign: "center" as const,
        textPosition: "bottom" as const,
        textMargin: 2,
        background: "#ffffff",
        lineColor: "#000000",
        margin: 10
      };

      JsBarcode(canvasRef.current, text, options);
      
    } catch (err) {
      setError(`Barcode generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const downloadBarcode = () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode-${format}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleReset = () => {
    setText("123456789012");
    setFormat("CODE128");
    setWidth(2);
    setHeight(100);
    setDisplayValue(true);
    setError(null);
  };

  const getFormatInfo = (formatValue: string) => barcodeFormats.find(f => f.value === formatValue);

  const validateInput = (inputText: string, barcodeFormat: string) => {
    switch (barcodeFormat) {
      case 'EAN13':
        return /^\d{13}$/.test(inputText) ? null : "EAN-13 requires exactly 13 digits";
      case 'EAN8':
        return /^\d{8}$/.test(inputText) ? null : "EAN-8 requires exactly 8 digits";
      case 'UPC':
        return /^\d{12}$/.test(inputText) ? null : "UPC-A requires exactly 12 digits";
      case 'ITF14':
        return /^\d{14}$/.test(inputText) ? null : "ITF-14 requires exactly 14 digits";
      case 'CODE39':
        return /^[A-Z0-9 .\-$\/+%]+$/.test(inputText) ? null : "CODE 39 supports A-Z, 0-9, and symbols . - $ / + %";
      case 'MSI':
        return /^\d+$/.test(inputText) ? null : "MSI supports numeric characters only";
      case 'pharmacode':
        const num = parseInt(inputText);
        return (num >= 3 && num <= 131070) ? null : "Pharmacode requires number between 3 and 131070";
      default:
        return null; // CODE128 supports all ASCII
    }
  };

  useEffect(() => {
    generateBarcode();
  }, []);

  const inputError = validateInput(text, format);

  return (
    <div className="max-w-6xl mx-auto">
      <AdSlot position="top" id="BG-001" size="large" className="mb-6" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Barcode Generator
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Generate various barcode formats for products and inventory
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      {(error || inputError) ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error || inputError}
          </AlertDescription>
        </Alert> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Barcode Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="barcode-text">Text/Data</Label>
              <Input
                id="barcode-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or numbers..."
                data-testid="barcode-text"
                className={inputError ? 'border-red-500' : ''}
              />
              {inputError ? <div className="text-sm text-red-600 mt-1">{inputError}</div> : null}
            </div>

            <div>
              <Label htmlFor="format">Barcode Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {barcodeFormats.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      {fmt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getFormatInfo(format)?.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Bar Width</Label>
                <Select value={width.toString()} onValueChange={(value) => setWidth(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1px (Thin)</SelectItem>
                    <SelectItem value="2">2px (Normal)</SelectItem>
                    <SelectItem value="3">3px (Thick)</SelectItem>
                    <SelectItem value="4">4px (Very Thick)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Select value={height.toString()} onValueChange={(value) => setHeight(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50px (Short)</SelectItem>
                    <SelectItem value="100">100px (Normal)</SelectItem>
                    <SelectItem value="150">150px (Tall)</SelectItem>
                    <SelectItem value="200">200px (Very Tall)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="display-value"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="display-value">Display text below barcode</Label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={generateBarcode}
                disabled={!text.trim() || !!inputError}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Barcode
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Barcode
              <Badge variant="outline">
                {format}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center text-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white mx-auto"
              />
              
              <div className="mt-4">
                <Button
                  onClick={downloadBarcode}
                  disabled={!!error || !!inputError}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Common Use Cases:</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• <strong>EAN-13/UPC:</strong> Retail products</li>
            <li>• <strong>CODE 128:</strong> Shipping and logistics</li>
            <li>• <strong>CODE 39:</strong> Industrial applications</li>
            <li>• <strong>ITF-14:</strong> Packaging and cases</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Tips:</h3>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Use CODE 128 for maximum compatibility</li>
            <li>• EAN/UPC codes need specific lengths</li>
            <li>• Test with your barcode scanner</li>
            <li>• Consider printing size and resolution</li>
          </ul>
        </div>
      </div>

      <AdSlot position="sidebar" id="BG-002" size="medium" className="mt-6" />
    </div>
  );
}