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
import { ArrowLeftRight, Copy, Check, Calculator, Share } from "lucide-react";
import {
  updateURL,
  copyShareableURL,
  getValidatedParam,
} from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";

interface UnitGroup {
  name: string;
  units: { [key: string]: { name: string; factor: number; symbol: string } };
}

const unitGroups: { [key: string]: UnitGroup } = {
  weight: {
    name: "Weight / Mass",
    units: {
      mg: { name: "Milligram", factor: 0.000001, symbol: "mg" },
      g: { name: "Gram", factor: 0.001, symbol: "g" },
      kg: { name: "Kilogram", factor: 1, symbol: "kg" },
      oz: { name: "Ounce", factor: 0.0283495, symbol: "oz" },
      lb: { name: "Pound", factor: 0.453592, symbol: "lb" },
      stone: { name: "Stone", factor: 6.35029, symbol: "st" },
      ton: { name: "Metric Ton", factor: 1000, symbol: "t" },
      uston: { name: "US Ton", factor: 907.185, symbol: "ton" },
      carat: { name: "Carat", factor: 0.0002, symbol: "ct" },
      grain: { name: "Grain", factor: 0.0000647989, symbol: "gr" },
    },
  },
  distance: {
    name: "Distance / Length",
    units: {
      mm: { name: "Millimeter", factor: 0.001, symbol: "mm" },
      cm: { name: "Centimeter", factor: 0.01, symbol: "cm" },
      m: { name: "Meter", factor: 1, symbol: "m" },
      km: { name: "Kilometer", factor: 1000, symbol: "km" },
      in: { name: "Inch", factor: 0.0254, symbol: "in" },
      ft: { name: "Foot", factor: 0.3048, symbol: "ft" },
      yd: { name: "Yard", factor: 0.9144, symbol: "yd" },
      mi: { name: "Mile", factor: 1609.34, symbol: "mi" },
      nmi: { name: "Nautical Mile", factor: 1852, symbol: "nmi" },
      angstrom: { name: "Angstrom", factor: 0.0000000001, symbol: "Å" },
      micron: { name: "Micrometer", factor: 0.000001, symbol: "μm" },
      lightyear: { name: "Light Year", factor: 9.461e15, symbol: "ly" },
    },
  },
  area: {
    name: "Area",
    units: {
      mm2: { name: "Square Millimeter", factor: 0.000001, symbol: "mm²" },
      cm2: { name: "Square Centimeter", factor: 0.0001, symbol: "cm²" },
      m2: { name: "Square Meter", factor: 1, symbol: "m²" },
      km2: { name: "Square Kilometer", factor: 1000000, symbol: "km²" },
      in2: { name: "Square Inch", factor: 0.00064516, symbol: "in²" },
      ft2: { name: "Square Foot", factor: 0.092903, symbol: "ft²" },
      yd2: { name: "Square Yard", factor: 0.836127, symbol: "yd²" },
      acre: { name: "Acre", factor: 4046.86, symbol: "ac" },
      hectare: { name: "Hectare", factor: 10000, symbol: "ha" },
      mi2: { name: "Square Mile", factor: 2589988.11, symbol: "mi²" },
    },
  },
  volume: {
    name: "Volume",
    units: {
      ml: { name: "Milliliter", factor: 0.001, symbol: "ml" },
      l: { name: "Liter", factor: 1, symbol: "l" },
      m3: { name: "Cubic Meter", factor: 1000, symbol: "m³" },
      in3: { name: "Cubic Inch", factor: 0.0163871, symbol: "in³" },
      ft3: { name: "Cubic Foot", factor: 28.3168, symbol: "ft³" },
      yd3: { name: "Cubic Yard", factor: 764.555, symbol: "yd³" },
      floz: { name: "Fluid Ounce (US)", factor: 0.0295735, symbol: "fl oz" },
      cup: { name: "Cup (US)", factor: 0.236588, symbol: "cup" },
      pint: { name: "Pint (US)", factor: 0.473176, symbol: "pt" },
      quart: { name: "Quart (US)", factor: 0.946353, symbol: "qt" },
      gallon: { name: "Gallon (US)", factor: 3.78541, symbol: "gal" },
      barrel: { name: "Barrel (Oil)", factor: 158.987, symbol: "bbl" },
    },
  },
  pressure: {
    name: "Pressure",
    units: {
      pa: { name: "Pascal", factor: 1, symbol: "Pa" },
      kpa: { name: "Kilopascal", factor: 1000, symbol: "kPa" },
      mpa: { name: "Megapascal", factor: 1000000, symbol: "MPa" },
      bar: { name: "Bar", factor: 100000, symbol: "bar" },
      atm: { name: "Atmosphere", factor: 101325, symbol: "atm" },
      psi: { name: "Pound per Square Inch", factor: 6894.76, symbol: "psi" },
      torr: { name: "Torr", factor: 133.322, symbol: "Torr" },
      mmhg: { name: "Millimeter of Mercury", factor: 133.322, symbol: "mmHg" },
      inhg: { name: "Inch of Mercury", factor: 3386.39, symbol: "inHg" },
      mbar: { name: "Millibar", factor: 100, symbol: "mbar" },
    },
  },
  temperature: {
    name: "Temperature",
    units: {
      c: { name: "Celsius", factor: 1, symbol: "°C" },
      f: { name: "Fahrenheit", factor: 1, symbol: "°F" },
      k: { name: "Kelvin", factor: 1, symbol: "K" },
      r: { name: "Rankine", factor: 1, symbol: "°R" },
    },
  },
  energy: {
    name: "Energy",
    units: {
      j: { name: "Joule", factor: 1, symbol: "J" },
      kj: { name: "Kilojoule", factor: 1000, symbol: "kJ" },
      cal: { name: "Calorie", factor: 4.184, symbol: "cal" },
      kcal: { name: "Kilocalorie", factor: 4184, symbol: "kcal" },
      wh: { name: "Watt Hour", factor: 3600, symbol: "Wh" },
      kwh: { name: "Kilowatt Hour", factor: 3600000, symbol: "kWh" },
      btu: { name: "British Thermal Unit", factor: 1055.06, symbol: "BTU" },
      erg: { name: "Erg", factor: 0.0000001, symbol: "erg" },
      ev: { name: "Electron Volt", factor: 1.602e-19, symbol: "eV" },
      therm: { name: "Therm", factor: 105506000, symbol: "thm" },
    },
  },
  power: {
    name: "Power",
    units: {
      w: { name: "Watt", factor: 1, symbol: "W" },
      kw: { name: "Kilowatt", factor: 1000, symbol: "kW" },
      mw: { name: "Megawatt", factor: 1000000, symbol: "MW" },
      hp: { name: "Horsepower (Mechanical)", factor: 745.7, symbol: "hp" },
      ps: { name: "Metric Horsepower", factor: 735.5, symbol: "PS" },
      btu_h: { name: "BTU per Hour", factor: 0.293071, symbol: "BTU/h" },
      cal_s: { name: "Calorie per Second", factor: 4.184, symbol: "cal/s" },
      erg_s: { name: "Erg per Second", factor: 0.0000001, symbol: "erg/s" },
    },
  },
  speed: {
    name: "Speed / Velocity",
    units: {
      ms: { name: "Meter per Second", factor: 1, symbol: "m/s" },
      kmh: { name: "Kilometer per Hour", factor: 0.277778, symbol: "km/h" },
      mph: { name: "Mile per Hour", factor: 0.44704, symbol: "mph" },
      fps: { name: "Foot per Second", factor: 0.3048, symbol: "ft/s" },
      knot: { name: "Knot", factor: 0.514444, symbol: "kn" },
      mach: { name: "Mach (Speed of Sound)", factor: 343, symbol: "Mach" },
      c: { name: "Speed of Light", factor: 299792458, symbol: "c" },
    },
  },
};

export default function UnitConverter() {
  const [selectedCategory, setSelectedCategory] = useState("weight");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [inputValue, setInputValue] = useState("1");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load parameters from URL with validation
    const validCategories = Object.keys(unitGroups);
    const urlCategory = getValidatedParam("cat", "weight", {
      type: "enum",
      allowedValues: validCategories,
    });

    const categoryUnits = Object.keys(
      unitGroups[urlCategory as keyof typeof unitGroups].units
    );
    const urlFrom = getValidatedParam("from", "", {
      type: "enum",
      allowedValues: categoryUnits,
    });
    const urlTo = getValidatedParam("to", "", {
      type: "enum",
      allowedValues: categoryUnits,
    });
    const urlValue = getValidatedParam("val", "1", {
      type: "string",
      pattern: /^-?\d*\.?\d*$/,
      maxLength: 20,
    });

    setSelectedCategory(urlCategory as string);
    setInputValue(urlValue as string);

    if (
      urlFrom &&
      urlTo &&
      unitGroups[urlCategory as keyof typeof unitGroups]
    ) {
      setFromUnit(urlFrom as string);
      setToUnit(urlTo as string);
    }
  }, []);

  // Set default units when category changes
  useEffect(() => {
    const units = Object.keys(unitGroups[selectedCategory].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  }, [selectedCategory]);

  const convertTemperature = useCallback(
    (value: number, from: string, to: string): number => {
      // Convert to Celsius first
      let celsius = value;
      switch (from) {
        case "f":
          celsius = ((value - 32) * 5) / 9;
          break;
        case "k":
          celsius = value - 273.15;
          break;
        case "r":
          celsius = ((value - 491.67) * 5) / 9;
          break;
        default:
          // Celsius is default, no conversion needed
          break;
      }

      // Convert from Celsius to target
      switch (to) {
        case "f":
          return (celsius * 9) / 5 + 32;
        case "k":
          return celsius + 273.15;
        case "r":
          return (celsius * 9) / 5 + 491.67;
        default:
          return celsius;
      }
    },
    []
  );

  const convertUnits = useCallback(() => {
    try {
      const value = parseFloat(inputValue);
      if (isNaN(value)) {
        setResult("");
        return;
      }

      const category = unitGroups[selectedCategory];

      if (selectedCategory === "temperature") {
        setResult(convertTemperature(value, fromUnit, toUnit).toString());
      } else {
        const fromFactor = category.units[fromUnit].factor;
        const toFactor = category.units[toUnit].factor;
        const convertedValue = (value * fromFactor) / toFactor;
        setResult(convertedValue.toString());
      }
    } catch {
      console.error("Conversion error occurred");
      setResult("");
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory, convertTemperature]);

  // Convert units when inputs change
  useEffect(() => {
    if (inputValue && fromUnit && toUnit) {
      convertUnits();
      updateURL({
        cat: selectedCategory,
        from: fromUnit,
        to: toUnit,
        val: inputValue,
      });
    }
  }, [inputValue, fromUnit, toUnit, selectedCategory, convertUnits]);

  const shareConversion = async () => {
    const success = await copyShareableURL({
      cat: selectedCategory,
      from: fromUnit,
      to: toUnit,
      val: inputValue,
    });
    if (success) {
      toast({
        title: "Conversion shared!",
        description: "URL copied to clipboard with current conversion settings",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const copyResult = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error("Failed to copy");
      }
    }
  };

  const formatResult = (value: string): string => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return "";

    // Format with appropriate precision
    if (Math.abs(num) >= 1000000 || Math.abs(num) < 0.001) {
      return num.toExponential(6);
    } else if (Math.abs(num) >= 100) {
      return num.toFixed(2);
    } else if (Math.abs(num) >= 1) {
      return num.toFixed(4);
    }
    return num.toFixed(6);
  };

  const currentCategory = unitGroups[selectedCategory];
  const unitOptions = Object.entries(currentCategory.units);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Unit Converter
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Convert between various units of weight, distance, area, volume,
          pressure, and more
        </p>
      </div>

      {/* Category Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Select Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger data-testid="category-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(unitGroups).map(([key, group]) => (
                <SelectItem key={key} value={key}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Conversion Interface */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{currentCategory.name} Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="input-value">Value</Label>
              <Input
                id="input-value"
                type="number"
                step="any"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Enter value"
                data-testid="input-value"
              />
            </div>
            <div>
              <Label htmlFor="from-unit">From</Label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger data-testid="from-unit-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map(([key, unit]) => (
                    <SelectItem key={key} value={key}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="to-unit">To</Label>
              <div className="flex gap-2">
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger data-testid="to-unit-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(([key, unit]) => (
                      <SelectItem key={key} value={key}>
                        {unit.name} ({unit.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={swapUnits}
                  data-testid="swap-units-button"
                  disabled={fromUnit === toUnit}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          {result ? (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Result
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyResult}
                  data-testid="copy-result-button"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="text-2xl font-mono text-slate-900 dark:text-slate-100">
                {formatResult(result)} {currentCategory.units[toUnit]?.symbol}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {inputValue} {currentCategory.units[fromUnit]?.symbol} ={" "}
                {formatResult(result)} {currentCategory.units[toUnit]?.symbol}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={shareConversion}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center space-x-2"
                  data-testid="share-conversion-button"
                >
                  <Share className="w-4 h-4" />
                  <span>Share Conversion</span>
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-center my-8" />

      {/* Quick Conversion Reference */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Common {currentCategory.name} Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {getCommonConversions(selectedCategory).map((conversion, index) => (
              <div
                key={index}
                className="flex justify-between p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
              >
                <span className="text-slate-600 dark:text-slate-400">
                  {conversion.from}
                </span>
                <span className="font-mono text-slate-900 dark:text-slate-100">
                  {conversion.to}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Unit Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Supported Categories:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Weight/Mass (mg, g, kg, oz, lb, stone, ton)</li>
                <li>• Distance/Length (mm, cm, m, km, in, ft, yd, mi)</li>
                <li>• Area (mm², cm², m², km², in², ft², acre, hectare)</li>
                <li>• Volume (ml, l, m³, fl oz, cup, pint, quart, gallon)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Advanced Categories:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Pressure (Pa, bar, atm, psi, torr, mmHg)</li>
                <li>• Temperature (°C, °F, K, °R)</li>
                <li>• Energy (J, cal, Wh, BTU, eV)</li>
                <li>• Power (W, kW, hp, BTU/h)</li>
                <li>• Speed (m/s, km/h, mph, knot, Mach)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8" />
    </div>
  );
}

function getCommonConversions(
  category: string
): Array<{ from: string; to: string }> {
  const conversions: { [key: string]: Array<{ from: string; to: string }> } = {
    weight: [
      { from: "1 kg", to: "2.205 lb" },
      { from: "1 lb", to: "453.59 g" },
      { from: "1 oz", to: "28.35 g" },
      { from: "1 stone", to: "6.35 kg" },
      { from: "1 ton", to: "1000 kg" },
      { from: "1 carat", to: "0.2 g" },
    ],
    distance: [
      { from: "1 m", to: "3.281 ft" },
      { from: "1 km", to: "0.621 mi" },
      { from: "1 in", to: "2.54 cm" },
      { from: "1 ft", to: "30.48 cm" },
      { from: "1 yd", to: "0.914 m" },
      { from: "1 mi", to: "1.609 km" },
    ],
    area: [
      { from: "1 m²", to: "10.76 ft²" },
      { from: "1 km²", to: "0.386 mi²" },
      { from: "1 hectare", to: "2.471 acre" },
      { from: "1 acre", to: "4047 m²" },
      { from: "1 ft²", to: "0.093 m²" },
      { from: "1 in²", to: "6.452 cm²" },
    ],
    volume: [
      { from: "1 l", to: "0.264 gal" },
      { from: "1 gal", to: "3.785 l" },
      { from: "1 m³", to: "35.31 ft³" },
      { from: "1 cup", to: "236.6 ml" },
      { from: "1 pint", to: "473.2 ml" },
      { from: "1 quart", to: "946.4 ml" },
    ],
    pressure: [
      { from: "1 bar", to: "14.5 psi" },
      { from: "1 atm", to: "101.3 kPa" },
      { from: "1 psi", to: "6.895 kPa" },
      { from: "1 torr", to: "133.3 Pa" },
      { from: "1 mmHg", to: "133.3 Pa" },
      { from: "1 inHg", to: "3.386 kPa" },
    ],
    temperature: [
      { from: "0°C", to: "32°F" },
      { from: "100°C", to: "212°F" },
      { from: "0°F", to: "-17.8°C" },
      { from: "0 K", to: "-273.15°C" },
      { from: "20°C", to: "68°F" },
      { from: "37°C", to: "98.6°F" },
    ],
    energy: [
      { from: "1 kWh", to: "3.6 MJ" },
      { from: "1 cal", to: "4.184 J" },
      { from: "1 BTU", to: "1055 J" },
      { from: "1 eV", to: "1.602×10⁻¹⁹ J" },
      { from: "1 kcal", to: "4184 J" },
      { from: "1 Wh", to: "3600 J" },
    ],
    power: [
      { from: "1 hp", to: "745.7 W" },
      { from: "1 kW", to: "1.34 hp" },
      { from: "1 PS", to: "735.5 W" },
      { from: "1 BTU/h", to: "0.293 W" },
      { from: "1 MW", to: "1000 kW" },
      { from: "1 cal/s", to: "4.184 W" },
    ],
    speed: [
      { from: "1 m/s", to: "3.6 km/h" },
      { from: "1 mph", to: "1.609 km/h" },
      { from: "1 knot", to: "1.852 km/h" },
      { from: "1 km/h", to: "0.278 m/s" },
      { from: "1 ft/s", to: "0.305 m/s" },
      { from: "Mach 1", to: "343 m/s" },
    ],
  };

  return conversions[category] || [];
}
