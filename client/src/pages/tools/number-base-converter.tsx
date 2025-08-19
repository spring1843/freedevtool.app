import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/ui/copy-button";
import { Hash, Calculator, Share, RefreshCw, ArrowRight } from "lucide-react";
import {
  updateURL,
  copyShareableURL,
  getValidatedParam,
} from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";

interface ConversionResult {
  base: number;
  value: string;
  name: string;
}

const commonBases = [
  { value: 2, label: "Binary (Base 2)", chars: "01" },
  { value: 8, label: "Octal (Base 8)", chars: "01234567" },
  { value: 10, label: "Decimal (Base 10)", chars: "0123456789" },
  { value: 16, label: "Hexadecimal (Base 16)", chars: "0123456789ABCDEF" },
  { value: 32, label: "Base 32", chars: "0123456789ABCDEFGHIJKLMNOPQRSTUV" },
  {
    value: 36,
    label: "Base 36",
    chars: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
  {
    value: 64,
    label: "Base 64",
    chars: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/",
  },
];

export default function NumberBaseConverter() {
  const [inputNumber, setInputNumber] = useState("42");
  const [inputBase, setInputBase] = useState(10);
  const [outputBases, setOutputBases] = useState<number[]>([2, 8, 16]);
  const [customBase, setCustomBase] = useState("");
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load parameters from URL with validation
    const urlNumber = getValidatedParam("num", "42", {
      type: "string",
      pattern: /^[0-9A-Fa-f+/\-_.]*$/,
      maxLength: 100,
    });
    const urlInputBase = getValidatedParam("from", 10, {
      type: "number",
      min: 2,
      max: 64,
    });
    const urlOutputBases = getValidatedParam("to", "2,8,16", {
      type: "array",
      allowedValues: Array.from({ length: 63 }, (_, i) => (i + 2).toString()),
      arrayMaxLength: 10,
    });

    setInputNumber(urlNumber as string);
    setInputBase(urlInputBase as number);

    if (Array.isArray(urlOutputBases)) {
      const validBases = urlOutputBases
        .map(b => parseInt(b, 10))
        .filter(b => b >= 2 && b <= 64);
      if (validBases.length > 0) {
        setOutputBases(validBases);
      }
    }
  }, []);

  useEffect(() => {
    convertNumber();
    // Update URL when input changes
    updateURL({
      num: inputNumber,
      from: inputBase.toString(),
      to: outputBases.join(","),
    });
  }, [inputNumber, inputBase, outputBases, convertNumber]);

  const getBaseCharacters = (base: number): string => {
    const commonBase = commonBases.find(b => b.value === base);
    if (commonBase) return commonBase.chars;

    if (base <= 10) {
      return "0123456789".slice(0, base);
    } else if (base <= 36) {
      return "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, base);
    } else if (base <= 62) {
      return "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".slice(
        0,
        base
      );
    } else if (base <= 64) {
      return "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/".slice(
        0,
        base
      );
    }

    // For bases > 64, use numbers
    let chars = "";
    for (let i = 0; i < base; i++) {
      chars += String.fromCharCode(48 + i); // ASCII starting from '0'
    }
    return chars;
  };

  const validateInput = (value: string, base: number): boolean => {
    if (!value.trim()) return false;

    const validChars = getBaseCharacters(base).toLowerCase();
    const normalizedValue = value.toLowerCase().replace(/\s/g, "");

    for (const char of normalizedValue) {
      if (!validChars.includes(char)) {
        return false;
      }
    }
    return true;
  };

  const convertFromBaseToDecimal = (value: string, base: number): number => {
    let decimal = 0;
    const chars = getBaseCharacters(base);
    const normalizedValue = value.toUpperCase().replace(/\s/g, "");

    for (let i = 0; i < normalizedValue.length; i++) {
      const char = normalizedValue[i];
      const digitValue = chars.indexOf(char);
      if (digitValue === -1) {
        throw new Error(`Invalid character '${char}' for base ${base}`);
      }
      decimal += digitValue * Math.pow(base, normalizedValue.length - 1 - i);
    }

    return decimal;
  };

  const convertDecimalToBase = (decimal: number, base: number): string => {
    if (decimal === 0) return "0";

    const chars = getBaseCharacters(base);
    let result = "";
    let num = Math.abs(decimal);

    while (num > 0) {
      result = chars[num % base] + result;
      num = Math.floor(num / base);
    }

    return decimal < 0 ? `-${result}` : result;
  };

  const convertNumber = useCallback(() => {
    try {
      setError("");

      if (!inputNumber.trim()) {
        setResults([]);
        return;
      }

      // Validate input
      if (!validateInput(inputNumber, inputBase)) {
        throw new Error(`Invalid input '${inputNumber}' for base ${inputBase}`);
      }

      // Convert input to decimal
      const decimal = convertFromBaseToDecimal(inputNumber, inputBase);

      // Convert to all output bases
      const newResults: ConversionResult[] = outputBases.map(base => {
        const converted = convertDecimalToBase(decimal, base);
        const baseName =
          commonBases.find(b => b.value === base)?.label || `Base ${base}`;

        return {
          base,
          value: converted,
          name: baseName,
        };
      });

      setResults(newResults);
    } catch {
      const errorMessage = "Conversion failed";
      setError(errorMessage);
      setResults([]);
    }
  }, [inputNumber, inputBase, outputBases]);

  const addCustomBase = () => {
    const base = parseInt(customBase, 10);
    if (isNaN(base) || base < 2 || base > 64) {
      toast({
        title: "Invalid base",
        description: "Base must be between 2 and 64",
        variant: "destructive",
      });
      return;
    }

    if (outputBases.includes(base)) {
      toast({
        title: "Base already added",
        description: `Base ${base} is already in the conversion list`,
        variant: "destructive",
      });
      return;
    }

    setOutputBases([...outputBases, base].sort((a, b) => a - b));
    setCustomBase("");
  };

  const removeBase = (base: number) => {
    setOutputBases(outputBases.filter(b => b !== base));
  };

  const addCommonBase = (base: number) => {
    if (!outputBases.includes(base)) {
      setOutputBases([...outputBases, base].sort((a, b) => a - b));
    }
  };

  const shareConverter = async () => {
    const success = await copyShareableURL({
      num: inputNumber,
      from: inputBase.toString(),
      to: outputBases.join(","),
    });
    if (success) {
      toast({
        title: "Number Base converter shared!",
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

  const loadExample = (type: "binary" | "hex" | "large") => {
    const examples = {
      binary: { number: "1101011", base: 2 },
      hex: { number: "FF", base: 16 },
      large: { number: "255", base: 10 },
    };

    const example = examples[type];
    setInputNumber(example.number);
    setInputBase(example.base);
  };

  const clearAll = () => {
    setInputNumber("");
    setResults([]);
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Number Base Converter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Convert numbers between different bases (binary, decimal, hexadecimal,
          and custom bases)
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Input Number
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="input-base">Input Base</Label>
                <Select
                  value={inputBase.toString()}
                  onValueChange={value => setInputBase(parseInt(value, 10))}
                >
                  <SelectTrigger data-testid="input-base-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {commonBases.map(base => (
                      <SelectItem
                        key={base.value}
                        value={base.value.toString()}
                      >
                        {base.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="number-input">Number</Label>
                <Input
                  id="number-input"
                  value={inputNumber}
                  onChange={e => setInputNumber(e.target.value)}
                  placeholder="Enter number..."
                  className="font-mono"
                  data-testid="number-input"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Valid characters for base {inputBase}:{" "}
                  {getBaseCharacters(inputBase)}
                </p>
              </div>

              {error ? (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              ) : null}

              <div className="flex gap-2">
                <Button
                  onClick={convertNumber}
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

              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => loadExample("binary")}
                  variant="outline"
                  size="sm"
                  data-testid="load-binary-button"
                >
                  Binary Example
                </Button>
                <Button
                  onClick={() => loadExample("hex")}
                  variant="outline"
                  size="sm"
                  data-testid="load-hex-button"
                >
                  Hex Example
                </Button>
                <Button
                  onClick={() => loadExample("large")}
                  variant="outline"
                  size="sm"
                  data-testid="load-decimal-button"
                >
                  Decimal Example
                </Button>
              </div>

              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="w-full"
                data-testid="clear-button"
              >
                Clear All
              </Button>
            </CardContent>
          </Card>

          {/* Output Base Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Output Bases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Quick Add Common Bases</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {commonBases
                    .filter(base => !outputBases.includes(base.value))
                    .map(base => (
                      <Button
                        key={base.value}
                        onClick={() => addCommonBase(base.value)}
                        variant="outline"
                        size="sm"
                        data-testid={`add-base-${base.value}-button`}
                      >
                        Base {base.value}
                      </Button>
                    ))}
                </div>
              </div>

              <div>
                <Label htmlFor="custom-base">Add Custom Base (2-64)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="custom-base"
                    type="number"
                    min="2"
                    max="64"
                    value={customBase}
                    onChange={e => setCustomBase(e.target.value)}
                    placeholder="Enter base..."
                    data-testid="custom-base-input"
                  />
                  <Button
                    onClick={addCustomBase}
                    disabled={!customBase}
                    data-testid="add-custom-base-button"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <Label>Active Output Bases</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {outputBases.map(base => (
                    <div
                      key={base}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm"
                    >
                      <span>Base {base}</span>
                      <Button
                        onClick={() => removeBase(base)}
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                        data-testid={`remove-base-${base}-button`}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Conversion Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <div className="space-y-3">
                  {/* Input Summary */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Input: {inputNumber} (Base {inputBase})
                      </span>
                      <span className="text-sm text-blue-600 dark:text-blue-300">
                        Decimal:{" "}
                        {convertFromBaseToDecimal(inputNumber, inputBase)}
                      </span>
                    </div>
                  </div>

                  {/* Conversion Results */}
                  {results.map(result => (
                    <div
                      key={result.base}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {result.name}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                        <CopyButton text={result.value} size="sm" />
                      </div>
                      <div className="text-xl font-mono text-slate-900 dark:text-slate-100 break-all">
                        {result.value}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Characters: {getBaseCharacters(result.base)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter a number above to see conversions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-center my-8" />

      {/* Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Number Base Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Supported Bases:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>
                  • <strong>Binary (Base 2):</strong> 0, 1
                </li>
                <li>
                  • <strong>Octal (Base 8):</strong> 0-7
                </li>
                <li>
                  • <strong>Decimal (Base 10):</strong> 0-9
                </li>
                <li>
                  • <strong>Hexadecimal (Base 16):</strong> 0-9, A-F
                </li>
                <li>
                  • <strong>Base 32:</strong> 0-9, A-V
                </li>
                <li>
                  • <strong>Base 36:</strong> 0-9, A-Z
                </li>
                <li>
                  • <strong>Custom bases:</strong> 2-64
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Convert from any base to any other base</li>
                <li>• Multiple output bases simultaneously</li>
                <li>• Input validation for each base</li>
                <li>• Character set display for each base</li>
                <li>• URL sharing with current settings</li>
                <li>• Example data for quick testing</li>
                <li>• Copy individual results to clipboard</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="font-semibold mb-2">Common Use Cases:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Programming:</strong>
                <ul className="text-slate-600 dark:text-slate-400 mt-1">
                  <li>• Binary operations</li>
                  <li>• Hexadecimal colors</li>
                  <li>• Memory addresses</li>
                </ul>
              </div>
              <div>
                <strong>Networking:</strong>
                <ul className="text-slate-600 dark:text-slate-400 mt-1">
                  <li>• IP address conversion</li>
                  <li>• Subnet calculations</li>
                  <li>• Base64 encoding</li>
                </ul>
              </div>
              <div>
                <strong>Mathematics:</strong>
                <ul className="text-slate-600 dark:text-slate-400 mt-1">
                  <li>• Number theory</li>
                  <li>• Computer science</li>
                  <li>• Algorithm design</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8" />
    </div>
  );
}
