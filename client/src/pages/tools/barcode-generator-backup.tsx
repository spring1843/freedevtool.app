import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart3, Download, Copy, Package, CreditCard, Hash, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";
import JsBarcode from "jsbarcode";
import { usePersistentForm } from "@/hooks/use-persistent-state";

// Standalone barcode generation using JsBarcode library
const generateBarcode = (text: string, format: string, width = 400, height = 100): string => {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    
    // Generate barcode using JsBarcode
    JsBarcode(canvas, text, {
      format: format.toUpperCase(),
      width: 2,
      height,
      displayValue: true,
      fontSize: 14,
      margin: 10,
      background: "#ffffff",
      lineColor: "#000000"
    });
    
    return canvas.toDataURL();
  } catch {
    console.error('Barcode generation failed');
    return '';
  }
};

type BarcodeType = 'code128' | 'code39' | 'ean13' | 'ean8' | 'upc';

interface BarcodePreset {
  type: BarcodeType;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
  description: string;
  chartType: string;
  validate: (input: string) => { valid: boolean; error?: string };
  format: (input: string) => string;
}

const barcodePresets: BarcodePreset[] = [
  {
    type: 'code128',
    name: 'Code 128',
    icon: <BarChart3 className="w-4 h-4" />,
    placeholder: 'ABC123456789',
    description: 'Versatile barcode for alphanumeric data',
    chartType: 'CODE128',
    validate: (input: string) => {
      if (!input.trim()) return { valid: false, error: 'Input cannot be empty' };
      if (input.length > 80) return { valid: false, error: 'Code 128 supports up to 80 characters' };
      return { valid: true };
    },
    format: (input: string) => input
  },
  {
    type: 'code39',
    name: 'Code 39',
    icon: <Hash className="w-4 h-4" />,
    placeholder: 'ABCD123456',
    description: 'Alphanumeric barcode with uppercase letters, digits, and some symbols',
    chartType: 'CODE39',
    validate: (input: string) => {
      if (!input.trim()) return { valid: false, error: 'Input cannot be empty' };
      const validChars = /^[A-Z0-9\-. $\/+%]*$/;
      if (!validChars.test(input.toUpperCase())) {
        return { valid: false, error: 'Code 39 only supports uppercase letters, digits, and symbols: - . $ / + %' };
      }
      if (input.length > 43) return { valid: false, error: 'Code 39 supports up to 43 characters' };
      return { valid: true };
    },
    format: (input: string) => input.toUpperCase()
  },
  {
    type: 'ean13',
    name: 'EAN-13',
    icon: <Package className="w-4 h-4" />,
    placeholder: '1234567890123',
    description: 'European Article Number, 13 digits for retail products',
    chartType: 'EAN13',
    validate: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length !== 13) return { valid: false, error: 'EAN-13 must be exactly 13 digits' };
      return { valid: true };
    },
    format: (input: string) => input.replace(/\D/g, '').slice(0, 13)
  },
  {
    type: 'ean8',
    name: 'EAN-8',
    icon: <Package className="w-4 h-4" />,
    placeholder: '12345678',
    description: 'European Article Number, 8 digits for small products',
    chartType: 'EAN8',
    validate: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length !== 8) return { valid: false, error: 'EAN-8 must be exactly 8 digits' };
      return { valid: true };
    },
    format: (input: string) => input.replace(/\D/g, '').slice(0, 8)
  },
  {
    type: 'upc',
    name: 'UPC-A',
    icon: <CreditCard className="w-4 h-4" />,
    placeholder: '123456789012',
    description: 'Universal Product Code, 12 digits for North American products',
    chartType: 'UPC',
    validate: (input: string) => {
      const digits = input.replace(/\D/g, '');
      if (digits.length !== 12) return { valid: false, error: 'UPC-A must be exactly 12 digits' };
      return { valid: true };
    },
    format: (input: string) => input.replace(/\D/g, '').slice(0, 12)
  }
];

export default function BarcodeGenerator() {
  const { fields, updateField, resetFields } = usePersistentForm('barcode-generator', {
    inputText: "FREEDEVTOOL123",
    barcodeType: 'code128' as BarcodeType,
    barcodeWidth: 400,
    barcodeHeight: 100,
    barcodeUrl: "",
    error: ""
  });

  const { inputText, barcodeType, barcodeWidth, barcodeHeight, barcodeUrl, error } = fields;
  
  const { toast } = useToast();

  const currentPreset = barcodePresets.find(p => p.type === barcodeType) || barcodePresets[0];

  // Generate barcode
  const generateBarcodeImage = () => {
    if (!inputText.trim()) {
      updateField('error', "Please enter some text to generate a barcode");
      updateField('barcodeUrl', "");
      return;
    }

    const validation = currentPreset.validate(inputText);
    if (!validation.valid) {
      updateField('error', validation.error || "Invalid input for this barcode type");
      updateField('barcodeUrl', "");
      return;
    }

    try {
      const formattedText = currentPreset.format(inputText.trim());
      const url = generateBarcode(formattedText, currentPreset.chartType, barcodeWidth, barcodeHeight);
      updateField('barcodeUrl', url);
      updateField('error', "");
      
      toast({
        title: "Barcode Generated",
        description: `Generated ${currentPreset.name} barcode successfully.`,
      });
    } catch {
      updateField('error', "Failed to generate barcode. Please check your input.");
      updateField('barcodeUrl', "");
    }
  };

  // Auto-generate on input change and initial load
  useEffect(() => {
    if (inputText.trim()) {
      const timer = setTimeout(generateBarcodeImage, 500);
      return () => clearTimeout(timer);
    } 
      updateField('barcodeUrl', "");
      updateField('error', "");
    
  }, [inputText, barcodeType, barcodeWidth, barcodeHeight]);

  // Generate default barcode on initial load
  useEffect(() => {
    if (!barcodeUrl && inputText.trim()) {
      generateBarcodeImage();
    }
  }, []);

  // Download barcode
  const downloadBarcode = async () => {
    if (!barcodeUrl) return;
    
    try {
      const response = await fetch(barcodeUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode-${barcodeType}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your barcode is being downloaded.",
      });
    } catch {
      toast({
        title: "Download Failed",
        description: "Failed to download barcode.",
        variant: "destructive"
      });
    }
  };

  // Copy barcode URL
  const copyBarcodeUrl = () => {
    if (!barcodeUrl) return;
    
    navigator.clipboard.writeText(barcodeUrl).then(() => {
      toast({
        title: "URL Copied",
        description: "Barcode image URL copied to clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive"
      });
    });
  };

  // Quick preset buttons
  const usePreset = (preset: string) => {
    updateField('inputText', preset);
  };

  const getQuickPresets = (): string[] => {
    const presets: Record<BarcodeType, string[]> = {
      code128: ["ABC123456789", "HELLO WORLD", "Product-001", "SKU-2024-001"],
      code39: ["ABCD123456", "PRODUCT001", "ITEM-789", "CODE-39-TEST"],
      ean13: ["1234567890123", "8901234567890", "4012345678901", "5901234123457"],
      ean8: ["12345678", "87654321", "11223344", "99887766"],
      upc: ["123456789012", "876543210987", "111222333444", "555666777888"]
    };
    
    return presets[barcodeType] || [];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="BC-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Barcode Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Generate various types of barcodes including Code 128, Code 39, EAN-13, EAN-8, and UPC-A
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Barcode Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="barcode-type">Barcode Type</Label>
                <Select value={barcodeType} onValueChange={(value: BarcodeType) => updateField('barcodeType', value)}>
                  <SelectTrigger data-testid="barcode-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {barcodePresets.map((preset) => (
                      <SelectItem key={preset.type} value={preset.type}>
                        <div className="flex items-center gap-2">
                          {preset.icon}
                          {preset.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {currentPreset.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="barcode-width">Width</Label>
                  <Select value={barcodeWidth.toString()} onValueChange={(value) => updateField('barcodeWidth', parseInt(value))}>
                    <SelectTrigger data-testid="barcode-width-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">300px</SelectItem>
                      <SelectItem value="400">400px</SelectItem>
                      <SelectItem value="500">500px</SelectItem>
                      <SelectItem value="600">600px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="barcode-height">Height</Label>
                  <Select value={barcodeHeight.toString()} onValueChange={(value) => updateField('barcodeHeight', parseInt(value))}>
                    <SelectTrigger data-testid="barcode-height-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60px</SelectItem>
                      <SelectItem value="80">80px</SelectItem>
                      <SelectItem value="100">100px</SelectItem>
                      <SelectItem value="120">120px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="input-text">
                  {currentPreset.name} Data
                </Label>
                <Input
                  id="input-text"
                  placeholder={currentPreset.placeholder}
                  value={inputText}
                  onChange={(e) => updateField('inputText', e.target.value)}
                  data-testid="barcode-input"
                />
              </div>

              {error ? <Alert variant="destructive">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert> : null}

              <div className="flex gap-2">
                <Button 
                  onClick={generateBarcodeImage} 
                  className="flex-1"
                  disabled={!inputText.trim()}
                  data-testid="generate-barcode"
                >
                  Generate Barcode
                </Button>
                <Button onClick={resetFields} variant="outline" data-testid="reset-barcode-button">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                {barcodeUrl ? <>
                    <Button onClick={downloadBarcode} variant="outline" data-testid="download-barcode">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button onClick={copyBarcodeUrl} variant="outline" data-testid="copy-barcode-url">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </> : null}
              </div>
            </CardContent>
          </Card>

          {/* Quick Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {getQuickPresets().map((preset: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => usePreset(preset)}
                    className="justify-start text-left font-mono"
                    data-testid={`preset-${index}`}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barcode Display */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Barcode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[200px] p-4">
              {barcodeUrl ? (
                <div className="text-center">
                  <img
                    src={barcodeUrl}
                    alt="Generated Barcode"
                    className="max-w-full max-h-full mb-2"
                    data-testid="barcode-image"
                  />
                  <div className="text-sm font-mono text-slate-600 dark:text-slate-400">
                    {currentPreset.format(inputText)}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No Barcode Generated</p>
                  <p className="text-sm">Enter data above to generate a barcode</p>
                </div>
              )}
            </div>
            
            {barcodeUrl ? <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                <div>Size: {barcodeWidth}x{barcodeHeight} pixels</div>
                <div>Type: {currentPreset.name}</div>
              </div> : null}
          </CardContent>
        </Card>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="BC-002" size="medium" />
      </div>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>Barcode Types & Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Barcode Types:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• <strong>Code 128:</strong> Most versatile, supports all ASCII characters</li>
                <li>• <strong>Code 39:</strong> Alphanumeric, widely supported</li>
                <li>• <strong>EAN-13:</strong> European standard for retail products (13 digits)</li>
                <li>• <strong>EAN-8:</strong> Compact version for small products (8 digits)</li>
                <li>• <strong>UPC-A:</strong> North American standard (12 digits)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage Guidelines:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Barcodes auto-generate as you type</li>
                <li>• Each type has specific format requirements</li>
                <li>• Test barcodes with scanners before printing</li>
                <li>• Higher resolution works better for printing</li>
                <li>• Ensure adequate white space around barcodes</li>
              </ul>
            </div>
          </div>
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Note:</strong> Barcodes are generated using Google Charts API for simplicity. 
              For production use, consider using a dedicated barcode library for better control and offline generation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="BC-003" size="large" />
      </div>
    </div>
  );
}