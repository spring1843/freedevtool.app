// Color utility functions for palette generation

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface ColorInfo {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  name?: string;
}

export interface ColorPalette {
  name: string;
  colors: ColorInfo[];
  description: string;
}

// Convert hex to RGB
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert RGB to hex
export function rgbToHex(rgb: RGB): string {
  return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
}

// Color conversion constants
const RGB_MAX = 255;
const HUE_MAX = 360;
const PERCENT_MAX = 100;
const HUE_SIXTH = 6;
const HUE_HALF = 0.5;

// Convert RGB to HSL
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / RGB_MAX;
  const g = rgb.g / RGB_MAX;
  const b = rgb.b / RGB_MAX;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > HUE_HALF ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? HUE_SIXTH : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
        break;
    }
    h /= HUE_SIXTH;
  }

  return {
    h: Math.round(h * HUE_MAX),
    s: Math.round(s * PERCENT_MAX),
    l: Math.round(l * PERCENT_MAX),
  };
}

// Convert HSL to RGB
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / HUE_MAX;
  const s = hsl.s / PERCENT_MAX;
  const l = hsl.l / PERCENT_MAX;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Create color info object
export function createColorInfo(hex: string): ColorInfo {
  const rgb = hexToRgb(hex);
  if (!rgb) throw new Error("Invalid hex color");

  const hsl = rgbToHsl(rgb);

  return {
    hex: hex.toUpperCase(),
    rgb,
    hsl,
  };
}

// Generate complementary palette (opposite on color wheel)
export function generateComplementary(baseHex: string): ColorPalette {
  const baseColor = createColorInfo(baseHex);
  const complementHue = (baseColor.hsl.h + 180) % 360;

  const complementRgb = hslToRgb({
    h: complementHue,
    s: baseColor.hsl.s,
    l: baseColor.hsl.l,
  });

  const complementHex = rgbToHex(complementRgb);
  const complementColor = createColorInfo(complementHex);

  return {
    name: "Complementary",
    description: "Two colors opposite each other on the color wheel",
    colors: [baseColor, complementColor],
  };
}

// Generate triadic palette (3 colors equally spaced on color wheel)
export function generateTriadic(baseHex: string): ColorPalette {
  const baseColor = createColorInfo(baseHex);
  const colors = [baseColor];

  for (let i = 1; i < 3; i++) {
    const hue = (baseColor.hsl.h + i * 120) % 360;
    const rgb = hslToRgb({
      h: hue,
      s: baseColor.hsl.s,
      l: baseColor.hsl.l,
    });
    const hex = rgbToHex(rgb);
    colors.push(createColorInfo(hex));
  }

  return {
    name: "Triadic",
    description: "Three colors equally spaced around the color wheel",
    colors,
  };
}

// Generate analogous palette (adjacent colors on color wheel)
export function generateAnalogous(baseHex: string): ColorPalette {
  const baseColor = createColorInfo(baseHex);
  const colors: ColorInfo[] = [];

  // Generate 5 colors: 2 before, base, 2 after
  for (let i = -2; i <= 2; i++) {
    const hue = (baseColor.hsl.h + i * 30 + 360) % 360;
    const rgb = hslToRgb({
      h: hue,
      s: baseColor.hsl.s,
      l: baseColor.hsl.l,
    });
    const hex = rgbToHex(rgb);
    colors.push(createColorInfo(hex));
  }

  return {
    name: "Analogous",
    description: "Colors that are adjacent to each other on the color wheel",
    colors,
  };
}

// Generate monochromatic palette (different shades of same color)
export function generateMonochromatic(baseHex: string): ColorPalette {
  const baseColor = createColorInfo(baseHex);
  const colors: ColorInfo[] = [];

  // Generate 5 different lightness values
  const lightnessValues = [20, 40, 60, 80, 95];

  lightnessValues.forEach(lightness => {
    const rgb = hslToRgb({
      h: baseColor.hsl.h,
      s: baseColor.hsl.s,
      l: lightness,
    });
    const hex = rgbToHex(rgb);
    colors.push(createColorInfo(hex));
  });

  return {
    name: "Monochromatic",
    description: "Different shades and tints of the same color",
    colors,
  };
}

// Generate tetradic (square) palette (4 colors equally spaced)
export function generateTetradic(baseHex: string): ColorPalette {
  const baseColor = createColorInfo(baseHex);
  const colors = [baseColor];

  for (let i = 1; i < 4; i++) {
    const hue = (baseColor.hsl.h + i * 90) % 360;
    const rgb = hslToRgb({
      h: hue,
      s: baseColor.hsl.s,
      l: baseColor.hsl.l,
    });
    const hex = rgbToHex(rgb);
    colors.push(createColorInfo(hex));
  }

  return {
    name: "Tetradic",
    description: "Four colors equally spaced around the color wheel",
    colors,
  };
}

// Generate split complementary palette
export function generateSplitComplementary(baseHex: string): ColorPalette {
  const baseColor = createColorInfo(baseHex);
  const colors: ColorInfo[] = [baseColor];

  // Split complementary: base color + two colors on either side of complement
  const complementHue = (baseColor.hsl.h + 180) % 360;

  [-30, 30].forEach(offset => {
    const hue = (complementHue + offset + 360) % 360;
    const rgb = hslToRgb({
      h: hue,
      s: baseColor.hsl.s,
      l: baseColor.hsl.l,
    });
    const hex = rgbToHex(rgb);
    colors.push(createColorInfo(hex));
  });

  return {
    name: "Split Complementary",
    description: "Base color plus two colors on either side of its complement",
    colors,
  };
}

// Generate material design palette
export function generateMaterialPalette(baseHex: string): ColorPalette {
  const baseColor = createColorInfo(baseHex);
  const colors: ColorInfo[] = [];

  // Material Design color weights
  const materialWeights = [
    { weight: 50, lightness: 95 },
    { weight: 100, lightness: 90 },
    { weight: 200, lightness: 80 },
    { weight: 300, lightness: 70 },
    { weight: 400, lightness: 60 },
    { weight: 500, lightness: 50 }, // Base color
    { weight: 600, lightness: 40 },
    { weight: 700, lightness: 30 },
    { weight: 800, lightness: 20 },
    { weight: 900, lightness: 10 },
  ];

  materialWeights.forEach(({ lightness }) => {
    const rgb = hslToRgb({
      h: baseColor.hsl.h,
      s: Math.min(baseColor.hsl.s, 80), // Limit saturation for better material design
      l: lightness,
    });
    const hex = rgbToHex(rgb);
    colors.push(createColorInfo(hex));
  });

  return {
    name: "Material Design",
    description: "Material Design color palette with 10 weight variations",
    colors,
  };
}

// Get all palette types
export function getAllPaletteTypes() {
  return [
    {
      key: "complementary",
      name: "Complementary",
      generator: generateComplementary,
    },
    { key: "triadic", name: "Triadic", generator: generateTriadic },
    { key: "analogous", name: "Analogous", generator: generateAnalogous },
    {
      key: "monochromatic",
      name: "Monochromatic",
      generator: generateMonochromatic,
    },
    { key: "tetradic", name: "Tetradic", generator: generateTetradic },
    {
      key: "splitComplementary",
      name: "Split Complementary",
      generator: generateSplitComplementary,
    },
    {
      key: "material",
      name: "Material Design",
      generator: generateMaterialPalette,
    },
  ];
}

// Generate random color
export function generateRandomColor(): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Check if color is light or dark (for text contrast)
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

// Get contrast color (black or white)
export function getContrastColor(hex: string): string {
  return isLightColor(hex) ? "#000000" : "#FFFFFF";
}
