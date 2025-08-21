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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getAllPaletteTypes,
  generateRandomColor,
  getContrastColor,
  type ColorPalette,
  type ColorInfo,
} from "@/lib/color-tools";

import {
  Palette,
  Copy,
  Download,
  RefreshCw,
  Shuffle,
  RotateCcw,
  Share,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { getParam, updateURL, generateShareableURL } from "@/lib/url-sharing";

import { toolDefaults } from "@/data/defaults";

export default function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState(
    toolDefaults.colorPaletteGenerator
  );
  const [selectedType, setSelectedType] = useState("complementary");
  const [generatedPalettes, setGeneratedPalettes] = useState<ColorPalette[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const paletteTypes = getAllPaletteTypes();

  // Load state from URL parameters on component mount
  useEffect(() => {
    const urlBaseColor = getParam("baseColor", "");
    const urlSelectedType = getParam("selectedType", "");
    if (urlBaseColor) {
      setBaseColor(urlBaseColor);
    }
    if (urlSelectedType) {
      setSelectedType(urlSelectedType);
    }
  }, []);

  // Update URL when state changes
  const updateUrl = (newBaseColor?: string, newSelectedType?: string) => {
    updateURL({
      baseColor: newBaseColor || baseColor,
      selectedType: newSelectedType || selectedType,
    });
  };

  const generatePalette = useCallback(() => {
    setIsGenerating(true);

    try {
      const selectedGenerator = paletteTypes.find(
        type => type.key === selectedType
      );
      if (selectedGenerator) {
        const palette = selectedGenerator.generator(baseColor);
        setGeneratedPalettes([palette]);

        toast({
          title: "Palette Generated!",
          description: `Created ${selectedGenerator.name} palette with ${palette.colors.length} colors`,
        });
      }
    } catch (error) {
      console.error("Color generation error:", error);
      toast({
        title: "Error",
        description: "Invalid color format. Please use a valid hex color.",
        variant: "destructive",
      });
    }

    setIsGenerating(false);
  }, [baseColor, selectedType, paletteTypes, toast]);

  // Auto-generate palette on initial load
  useEffect(() => {
    if (generatedPalettes.length === 0) {
      generatePalette();
    }
  }, [generatePalette, generatedPalettes.length]);

  const generateAllPalettes = () => {
    setIsGenerating(true);

    try {
      const palettes = paletteTypes.map(type => type.generator(baseColor));
      setGeneratedPalettes(palettes);
    } catch {
      toast({
        title: "Error",
        description: "Invalid color format. Please use a valid hex color.",
        variant: "destructive",
      });
    }

    setIsGenerating(false);
  };

  const generateRandomBaseColor = () => {
    const randomColor = generateRandomColor();
    setBaseColor(randomColor);
    setGeneratedPalettes([]);
    updateUrl(randomColor);
  };

  const handleBaseColorChange = (color: string) => {
    setBaseColor(color);
    updateUrl(color);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    updateUrl(undefined, type);
  };

  const shareCurrentPalette = async () => {
    const shareUrl = generateShareableURL({
      baseColor,
      selectedType,
    });

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description:
          "Palette link copied to clipboard. Share it to recreate this exact palette.",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Share Link",
        description: shareUrl,
      });
    }
  };

  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Copied!",
      description: `Color ${color} copied to clipboard`,
    });
  };

  const copyPaletteToClipboard = (palette: ColorPalette) => {
    const colors = palette.colors.map(color => color.hex).join(", ");
    navigator.clipboard.writeText(colors);
    toast({
      title: "Palette Copied!",
      description: `${palette.name} palette copied to clipboard`,
    });
  };

  const exportPaletteAsCSS = (palette: ColorPalette) => {
    const cssVariables = palette.colors
      .map(
        (color, index) =>
          `  --color-${palette.name.toLowerCase().replace(/\s+/g, "-")}-${index + 1}: ${color.hex};`
      )
      .join("\n");

    const cssContent = `:root {\n${cssVariables}\n}`;

    const blob = new Blob([cssContent], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${palette.name.toLowerCase().replace(/\s+/g, "-")}-palette.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const ColorCard = ({ color, index }: { color: ColorInfo; index: number }) => {
    const textColor = getContrastColor(color.hex);

    return (
      <div
        className="relative group cursor-pointer transition-transform hover:scale-105"
        style={{ backgroundColor: color.hex }}
        onClick={() => copyColorToClipboard(color.hex)}
        data-testid={`color-${index}`}
      >
        <div
          className="p-4 min-h-[120px] flex flex-col justify-between"
          style={{ color: textColor }}
        >
          <div className="text-sm font-mono font-semibold">{color.hex}</div>
          <div className="text-xs opacity-75">
            <div>
              RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
            </div>
            <div>
              HSL({color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%)
            </div>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Copy className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  };

  const PaletteCard = ({ palette }: { palette: ColorPalette }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{palette.name}</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {palette.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyPaletteToClipboard(palette)}
              data-testid={`copy-palette-${palette.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPaletteAsCSS(palette)}
              data-testid={`export-palette-${palette.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Download className="w-4 h-4 mr-1" />
              CSS
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 border border-slate-200 dark:border-slate-700 overflow-hidden">
          {palette.colors.map((color, index) => (
            <ColorCard key={index} color={color} index={index} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {palette.colors.map((color, index) => (
            <div
              key={index}
              className="px-2 py-1 bg-slate-200 dark:bg-slate-700 font-mono text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 border"
              onClick={() => copyColorToClipboard(color.hex)}
            >
              {color.hex}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Color Palette Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Generate beautiful color palettes from any base color using color
          theory principles
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Palette Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="base-color">Base Color</Label>
              <div className="flex gap-2">
                <Input
                  id="base-color"
                  type="color"
                  value={baseColor}
                  onChange={e => handleBaseColorChange(e.target.value)}
                  className="w-16 h-10 p-1 border"
                  data-testid="color-picker"
                />
                <Input
                  type="text"
                  value={baseColor}
                  onChange={e => handleBaseColorChange(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1 font-mono"
                  data-testid="color-input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRandomBaseColor}
                  data-testid="random-color-button"
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="palette-type">Palette Type</Label>
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger data-testid="palette-type-select">
                  <SelectValue placeholder="Select palette type" />
                </SelectTrigger>
                <SelectContent>
                  {paletteTypes.map(type => (
                    <SelectItem key={type.key} value={type.key}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={generatePalette}
                disabled={isGenerating}
                className="flex-1"
                data-testid="generate-palette-button"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Palette className="w-4 h-4 mr-2" />
                )}
                Generate Palette
              </Button>
              <Button
                variant="outline"
                onClick={generateAllPalettes}
                disabled={isGenerating}
                data-testid="generate-all-button"
              >
                All Types
              </Button>
              <Button
                variant="outline"
                onClick={shareCurrentPalette}
                data-testid="share-palette-button"
              >
                <Share className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  setBaseColor("#3B82F6");
                  setSelectedType("complementary");
                  setGeneratedPalettes([]);
                  updateUrl("#3B82F6", "complementary");
                }}
                variant="outline"
                data-testid="reset-color-palette-button"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mb-8" />

      {/* Generated Palettes */}
      {generatedPalettes.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Generated Palettes
          </h3>
          <ScrollArea className="h-auto">
            <div className="space-y-6">
              {generatedPalettes.map((palette, index) => (
                <PaletteCard key={index} palette={palette} />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Usage Guide */}
      {generatedPalettes.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Palette Types:</h4>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  <li>
                    • <strong>Complementary:</strong> Two opposite colors
                  </li>
                  <li>
                    • <strong>Triadic:</strong> Three evenly spaced colors
                  </li>
                  <li>
                    • <strong>Analogous:</strong> Adjacent colors on the wheel
                  </li>
                  <li>
                    • <strong>Monochromatic:</strong> Shades of one color
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  <li>• Click any color to copy hex code</li>
                  <li>• Export palettes as CSS variables</li>
                  <li>• Generate random base colors</li>
                  <li>• View RGB and HSL values</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center mt-8" />
    </div>
  );
}
