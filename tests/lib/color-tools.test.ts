import { describe, it, expect } from "vitest";

describe("Color Tools Utilities", () => {
  describe("Color Format Conversion", () => {
    it("should convert hex to RGB", () => {
      const hexToRgb = (
        hex: string
      ): { r: number; g: number; b: number } | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : null;
      };

      expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("#00FF00")).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb("#0000FF")).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb("FF0000")).toEqual({ r: 255, g: 0, b: 0 }); // Without #
    });

    it("should convert RGB to hex", () => {
      const rgbToHex = (r: number, g: number, b: number): string => {
        const componentToHex = (c: number): string => {
          const hex = c.toString(16);
          return hex.length === 1 ? `0${hex}` : hex;
        };
        return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
      };

      expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
      expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
      expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
      expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
    });

    it("should convert RGB to HSL", () => {
      const rgbToHsl = (
        r: number,
        g: number,
        b: number
      ): { h: number; s: number; l: number } => {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;

        if (max === min) {
          h = s = 0; // achromatic
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
            default: {
              // Handle default case
            }
          }
          h /= 6;
        }

        return {
          h: Math.round(h * 360),
          s: Math.round(s * 100),
          l: Math.round(l * 100),
        };
      };

      expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 }); // Red
      expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 }); // Green
      expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 }); // Blue
      expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 }); // White
    });
  });

  describe("Color Validation", () => {
    it("should validate hex colors", () => {
      const isValidHex = (hex: string): boolean =>
        /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex);

      expect(isValidHex("#FF0000")).toBe(true);
      expect(isValidHex("#F00")).toBe(true);
      expect(isValidHex("FF0000")).toBe(true);
      expect(isValidHex("F00")).toBe(true);
      expect(isValidHex("#GGGGGG")).toBe(false);
      expect(isValidHex("#FF")).toBe(false);
      expect(isValidHex("#FFFFFFF")).toBe(false);
    });

    it("should validate RGB values", () => {
      const isValidRgb = (r: number, g: number, b: number): boolean =>
        r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;

      expect(isValidRgb(255, 0, 0)).toBe(true);
      expect(isValidRgb(0, 255, 0)).toBe(true);
      expect(isValidRgb(0, 0, 255)).toBe(true);
      expect(isValidRgb(-1, 0, 0)).toBe(false);
      expect(isValidRgb(256, 0, 0)).toBe(false);
      expect(isValidRgb(0, -1, 0)).toBe(false);
      expect(isValidRgb(0, 256, 0)).toBe(false);
    });
  });

  describe("Color Manipulation", () => {
    it("should lighten colors", () => {
      const lightenColor = (hex: string, percent: number): string => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return hex;

        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);

        const lighten = (value: number) => {
          const increased = Math.round(value + (255 - value) * (percent / 100));
          return Math.min(255, Math.max(0, increased));
        };

        const newR = lighten(r).toString(16).padStart(2, "0");
        const newG = lighten(g).toString(16).padStart(2, "0");
        const newB = lighten(b).toString(16).padStart(2, "0");

        return `#${newR}${newG}${newB}`;
      };

      // Test that lightening increases color values
      const original = "#808080"; // Gray
      const lightened = lightenColor(original, 20);
      expect(lightened).not.toBe(original);
      expect(parseInt(lightened.slice(1, 3), 16)).toBeGreaterThan(128); // R component increased
    });

    it("should darken colors", () => {
      const darkenColor = (hex: string, percent: number): string => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return hex;

        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);

        const darken = (value: number) => {
          const decreased = Math.round(value * (1 - percent / 100));
          return Math.min(255, Math.max(0, decreased));
        };

        const newR = darken(r).toString(16).padStart(2, "0");
        const newG = darken(g).toString(16).padStart(2, "0");
        const newB = darken(b).toString(16).padStart(2, "0");

        return `#${newR}${newG}${newB}`;
      };

      // Test that darkening decreases color values
      const original = "#808080"; // Gray
      const darkened = darkenColor(original, 20);
      expect(darkened).not.toBe(original);
      expect(parseInt(darkened.slice(1, 3), 16)).toBeLessThan(128); // R component decreased
    });
  });

  describe("Color Contrast and Accessibility", () => {
    it("should calculate relative luminance", () => {
      const getRelativeLuminance = (
        r: number,
        g: number,
        b: number
      ): number => {
        const sRGB = (value: number) => {
          value /= 255;
          return value <= 0.03928
            ? value / 12.92
            : Math.pow((value + 0.055) / 1.055, 2.4);
        };

        return 0.2126 * sRGB(r) + 0.7152 * sRGB(g) + 0.0722 * sRGB(b);
      };

      expect(getRelativeLuminance(255, 255, 255)).toBeCloseTo(1, 1); // White
      expect(getRelativeLuminance(0, 0, 0)).toBeCloseTo(0, 1); // Black
      expect(getRelativeLuminance(255, 0, 0)).toBeGreaterThan(0); // Red has some luminance
    });

    it("should calculate contrast ratio", () => {
      const getContrastRatio = (lum1: number, lum2: number): number => {
        const lightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (lightest + 0.05) / (darkest + 0.05);
      };

      expect(getContrastRatio(1, 0)).toBeCloseTo(21, 0); // White vs Black
      expect(getContrastRatio(1, 1)).toBe(1); // Same colors
      expect(getContrastRatio(0.5, 0.5)).toBe(1); // Same colors
    });

    it("should determine if colors meet WCAG contrast requirements", () => {
      const meetsWCAG = (
        contrastRatio: number,
        level: "AA" | "AAA" = "AA"
      ): boolean =>
        level === "AA" ? contrastRatio >= 4.5 : contrastRatio >= 7;

      expect(meetsWCAG(21)).toBe(true); // White vs Black
      expect(meetsWCAG(4.5)).toBe(true); // Minimum AA
      expect(meetsWCAG(4.4)).toBe(false); // Below AA
      expect(meetsWCAG(7, "AAA")).toBe(true); // Minimum AAA
      expect(meetsWCAG(6.9, "AAA")).toBe(false); // Below AAA
    });
  });

  describe("Color Palette Generation", () => {
    it("should generate complementary colors", () => {
      const getComplementary = (h: number): number => (h + 180) % 360;

      expect(getComplementary(0)).toBe(180); // Red -> Cyan
      expect(getComplementary(120)).toBe(300); // Green -> Magenta
      expect(getComplementary(240)).toBe(60); // Blue -> Yellow
      expect(getComplementary(330)).toBe(150); // Wrap around
    });

    it("should generate triadic colors", () => {
      const getTriadic = (h: number): [number, number] => [
        (h + 120) % 360,
        (h + 240) % 360,
      ];

      expect(getTriadic(0)).toEqual([120, 240]); // Red -> Green, Blue
      expect(getTriadic(60)).toEqual([180, 300]); // Yellow -> Cyan, Magenta
      expect(getTriadic(270)).toEqual([30, 150]); // Wrap around
    });

    it("should generate analogous colors", () => {
      const getAnalogous = (h: number, step = 30): [number, number] => [
        (h - step + 360) % 360,
        (h + step) % 360,
      ];

      expect(getAnalogous(180)).toEqual([150, 210]); // Cyan +/- 30°
      expect(getAnalogous(30)).toEqual([0, 60]); // Orange +/- 30°
      expect(getAnalogous(10)).toEqual([340, 40]); // Near red, wrap around
    });
  });
});
