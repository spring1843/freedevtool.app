// Global tools data with keyboard shortcuts
export interface Tool {
  name: string;
  path: string;
  shortcut: string;
  description: string;
  experimental?: boolean;
}

export interface ToolCategory {
  color: string;
  shortcut: string;
  tools: Tool[];
}

export interface ToolData {
  [key: string]: ToolCategory;
}

export const toolsData: ToolData = {
  Conversions: {
    color: "bg-blue-500 text-white dark:bg-blue-600",
    shortcut: "C",
    tools: [
      {
        name: "Date Converter",
        path: "/tools/date-converter",
        shortcut: "Ctrl+D",
        description: "Convert between timestamps, dates, and formats",
      },
      {
        name: "JSON ↔ YAML",
        path: "/tools/json-yaml-converter",
        shortcut: "Ctrl+Shift+Y",
        description: "Convert between JSON and YAML formats",
      },
      {
        name: "Timezone Converter",
        path: "/tools/timezone-converter",
        shortcut: "Ctrl+T",
        description: "Convert time across multiple timezones with precision",
      },
      {
        name: "Unit Converter",
        path: "/tools/unit-converter",
        shortcut: "Ctrl+Shift+U",
        description:
          "Convert between units of weight, distance, area, volume, pressure",
      },
      {
        name: "URL to JSON",
        path: "/tools/url-to-json",
        shortcut: "Ctrl+Shift+URL",
        description:
          "Convert URLs to JSON with parameter parsing and TLD lookup",
      },
      {
        name: "CSV to JSON",
        path: "/tools/csv-to-json",
        shortcut: "Ctrl+Shift+CSV",
        description: "Convert CSV data to JSON format with delimiter selection",
      },
      {
        name: "Number Base Converter",
        path: "/tools/number-base-converter",
        shortcut: "Ctrl+Shift+Base",
        description: "Convert numbers between different bases (2-64)",
      },
    ],
  },
  Formatters: {
    color: "bg-green-500 text-white dark:bg-green-600",
    shortcut: "F",
    tools: [
      {
        name: "JSON Formatter",
        path: "/tools/json-formatter",
        shortcut: "Ctrl+J",
        description: "Format and beautify JSON with validation",
      },
      {
        name: "HTML Beautifier",
        path: "/tools/html-formatter",
        shortcut: "Ctrl+H",
        description:
          "Beautify HTML with proper indentation and validate for errors",
      },
      {
        name: "YAML Formatter",
        path: "/tools/yaml-formatter",
        shortcut: "Ctrl+Y",
        description: "Format and beautify YAML configuration files",
      },
      {
        name: "Markdown Formatter",
        path: "/tools/markdown-formatter",
        shortcut: "Ctrl+M",
        description: "Format Markdown with live preview",
      },
      {
        name: "CSS Formatter",
        path: "/tools/css-formatter",
        shortcut: "Ctrl+Shift+C",
        description: "Format and beautify CSS stylesheets",
      },
      {
        name: "LESS Formatter",
        path: "/tools/less-formatter",
        shortcut: "Ctrl+L",
        description: "Format LESS CSS preprocessor files",
      },
      {
        name: "Time Formatter",
        path: "/tools/time-formatter",
        shortcut: "Ctrl+Shift+T",
        description: "Format time to all existing time standards",
      },
    ],
  },
  Encoders: {
    color: "bg-purple-500 text-white dark:bg-purple-600",
    shortcut: "E",
    tools: [
      {
        name: "Base64 Encoder",
        path: "/tools/base64",
        shortcut: "Ctrl+B",
        description: "Encode and decode Base64 data",
      },
      {
        name: "URL Encoder",
        path: "/tools/url-encoder",
        shortcut: "Ctrl+U",
        description: "URL encode and decode strings",
      },
      {
        name: "JWT Decoder",
        path: "/tools/jwt-decoder",
        shortcut: "Ctrl+Shift+J",
        description: "Decode and inspect JWT tokens",
      },
      {
        name: "TLS Certificate Decoder",
        path: "/tools/tls-decoder",
        shortcut: "Ctrl+Shift+S",
        description: "Decode TLS certificates",
      },
      {
        name: "MD5 Hash",
        path: "/tools/md5-hash",
        shortcut: "Ctrl+Shift+M",
        description: "Generate MD5 hashes",
      },
      {
        name: "BCrypt Hash",
        path: "/tools/bcrypt-hash",
        shortcut: "Ctrl+Shift+B",
        description: "Generate and verify BCrypt hashes",
      },
    ],
  },
  "Text Tools": {
    color: "bg-orange-500 text-white dark:bg-orange-600",
    shortcut: "T",
    tools: [
      {
        name: "Text Diff",
        path: "/tools/text-diff",
        shortcut: "Ctrl+Shift+D",
        description: "Compare text differences side by side",
      },
      {
        name: "Regex Tester",
        path: "/tools/regex-tester",
        shortcut: "Ctrl+E",
        description: "Test regular expressions with live matches",
      },
      {
        name: "Text Sorter",
        path: "/tools/text-sort",
        shortcut: "Ctrl+Shift+O",
        description: "Sort lines of text alphabetically or numerically",
      },
      {
        name: "Word Counter",
        path: "/tools/text-counter",
        shortcut: "Ctrl+W",
        description: "Count words, characters, and lines in text",
      },
      {
        name: "QR Generator",
        path: "/tools/qr-generator",
        shortcut: "Ctrl+Q",
        description: "Generate QR codes for text and URLs",
      },
      {
        name: "Barcode Generator",
        path: "/tools/barcode-generator",
        shortcut: "Ctrl+Shift+G",
        description: "Generate various barcode formats",
      },
      {
        name: "Lorem Generator",
        path: "/tools/lorem-generator",
        shortcut: "Ctrl+Shift+L",
        description: "Generate Lorem Ipsum placeholder text",
      },
      {
        name: "Unicode Characters",
        path: "/tools/unicode-characters",
        shortcut: "Ctrl+Shift+N",
        description: "Browse and copy Unicode characters from various scripts",
      },
      {
        name: "Password Generator",
        path: "/tools/password-generator",
        shortcut: "Ctrl+P",
        description: "Generate secure passwords with custom criteria",
      },
      {
        name: "UUID Generator",
        path: "/tools/uuid-generator",
        shortcut: "Ctrl+Shift+I",
        description: "Generate UUIDs (v1, v4) for unique identifiers",
      },
      {
        name: "Search & Replace",
        path: "/tools/search-replace",
        shortcut: "Ctrl+F",
        description: "Find and replace text with regex support",
      },
      {
        name: "Text Split",
        path: "/tools/text-split",
        shortcut: "Ctrl+Shift+Split",
        description: "Split text by delimiters or patterns",
      },
    ],
  },
  "Time Tools": {
    color: "bg-teal-500 text-white dark:bg-teal-600",
    shortcut: "I",
    tools: [
      {
        name: "World Clock",
        path: "/tools/world-clock",
        shortcut: "Ctrl+Shift+W",
        description: "View time across multiple cities and timezones",
      },
      {
        name: "Timer",
        path: "/tools/timer",
        shortcut: "Ctrl+Shift+Timer",
        description: "Countdown timer with audio alerts",
      },
      {
        name: "Stopwatch",
        path: "/tools/stopwatch",
        shortcut: "Ctrl+Shift+Stop",
        description: "Precision stopwatch with lap times",
      },
      {
        name: "Countdown",
        path: "/tools/countdown",
        shortcut: "Ctrl+Shift+Count",
        description: "Count down to a specific date and time",
      },
      {
        name: "Date/Time Difference",
        path: "/tools/datetime-diff",
        shortcut: "Ctrl+Shift+Diff",
        description: "Calculate differences between dates and times",
      },
      {
        name: "Metronome",
        path: "/tools/metronome",
        shortcut: "Ctrl+Shift+Metro",
        description: "Multi-tone metronome with custom timing intervals",
      },
    ],
  },
  "Financial Tools": {
    color: "bg-emerald-500 text-white dark:bg-emerald-600",
    shortcut: "N",
    tools: [
      {
        name: "Compound Interest",
        path: "/tools/compound-interest",
        shortcut: "Ctrl+Shift+Interest",
        description: "Calculate compound interest and investment growth",
      },
      {
        name: "Debt Repayment",
        path: "/tools/debt-repayment",
        shortcut: "Ctrl+Shift+Debt",
        description: "Plan debt payoff strategies and calculate payments",
      },
    ],
  },
  "Color Tools": {
    color: "bg-pink-500 text-white dark:bg-pink-600",
    shortcut: "O",
    tools: [
      {
        name: "Color Palette Generator",
        path: "/tools/color-palette-generator",
        shortcut: "Ctrl+Shift+Color",
        description: "Generate beautiful color palettes and schemes",
      },
    ],
  },
  Hardware: {
    color: "bg-slate-500 text-white dark:bg-slate-600",
    shortcut: "H",
    tools: [
      {
        name: "Camera Test",
        path: "/tools/webcam-test",
        shortcut: "Ctrl+Shift+V",
        description: "Test your camera and record video clips",
        experimental: true,
      },
      {
        name: "Microphone Test",
        path: "/tools/microphone-test",
        shortcut: "Ctrl+Shift+M",
        description:
          "Test microphone with audio level monitoring and recording",
      },
      {
        name: "Keyboard Test",
        path: "/tools/keyboard-test",
        shortcut: "Ctrl+Shift+K",
        description: "Test keyboard keys and see which buttons are pressed",
      },
    ],
  },
  Browser: {
    color: "bg-purple-500 text-white dark:bg-purple-600",
    shortcut: "B",
    tools: [
      {
        name: "Browser Info",
        path: "/tools/browser-info",
        shortcut: "Ctrl+Shift+Browser",
        description: "Display comprehensive browser and system information",
      },
    ],
  },
};

// Utility function to get all tools in a flat array
export function getAllTools(): Tool[] {
  return Object.values(toolsData).flatMap(category => category.tools);
}

// Utility function to get tools for demo (same as getAllTools but explicit)
export function getDemoTools(): Array<{
  name: string;
  path: string;
  description: string;
}> {
  return getAllTools().map(tool => ({
    name: tool.name,
    path: tool.path,
    description: tool.description,
  }));
}
