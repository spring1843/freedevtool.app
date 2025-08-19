import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  QrCode,
  Download,
  Copy,
  Smartphone,
  Globe,
  Mail,
  Phone,
  Wifi,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import QRCodeLib from "qrcode-generator";

// Standalone QR Code generation using qrcode-generator library
const generateQRCode = (text: string, size = 200): string => {
  try {
    const qr = QRCodeLib(0, "M"); // Type 0 (auto), Error correction level M
    qr.addData(text);
    qr.make();

    // Create SVG
    const cellSize = Math.floor(size / qr.getModuleCount());
    const margin = cellSize * 2;
    const svgSize = qr.getModuleCount() * cellSize + margin * 2;

    let svg = `<svg width="${svgSize}" height="${svgSize}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${svgSize}" height="${svgSize}" fill="white"/>`;

    for (let row = 0; row < qr.getModuleCount(); row++) {
      for (let col = 0; col < qr.getModuleCount(); col++) {
        if (qr.isDark(row, col)) {
          const x = col * cellSize + margin;
          const y = row * cellSize + margin;
          svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
        }
      }
    }
    svg += "</svg>";

    // Convert SVG to data URL
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } catch {
    console.error("QR Code generation failed");
    return "";
  }
};

type QRType = "text" | "url" | "email" | "phone" | "sms" | "wifi" | "vcard";

interface QRPreset {
  type: QRType;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
  format: (input: string) => string;
}

const qrPresets: QRPreset[] = [
  {
    type: "text",
    name: "Plain Text",
    icon: <QrCode className="w-4 h-4" />,
    placeholder: "Enter any text...",
    format: (input: string) => input,
  },
  {
    type: "url",
    name: "Website URL",
    icon: <Globe className="w-4 h-4" />,
    placeholder: "https://example.com",
    format: (input: string) =>
      input.startsWith("http") ? input : `https://${input}`,
  },
  {
    type: "email",
    name: "Email Address",
    icon: <Mail className="w-4 h-4" />,
    placeholder: "user@example.com",
    format: (input: string) => `mailto:${input}`,
  },
  {
    type: "phone",
    name: "Phone Number",
    icon: <Phone className="w-4 h-4" />,
    placeholder: "+1234567890",
    format: (input: string) => `tel:${input}`,
  },
  {
    type: "sms",
    name: "SMS Message",
    icon: <Smartphone className="w-4 h-4" />,
    placeholder: "+1234567890:Hello!",
    format: (input: string) => {
      const [phone, ...messageParts] = input.split(":");
      const message = messageParts.join(":");
      return `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ""}`;
    },
  },
  {
    type: "wifi",
    name: "WiFi Network",
    icon: <Wifi className="w-4 h-4" />,
    placeholder: "NetworkName:password:WPA",
    format: (input: string) => {
      const [ssid, password, security = "WPA"] = input.split(":");
      return `WIFI:T:${security};S:${ssid};P:${password};;`;
    },
  },
  {
    type: "vcard",
    name: "Contact Card",
    icon: <CreditCard className="w-4 h-4" />,
    placeholder: "John Doe:+1234567890:john@example.com",
    format: (input: string) => {
      const [name, phone, email] = input.split(":");
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\n${phone ? `TEL:${phone}\n` : ""}${email ? `EMAIL:${email}\n` : ""}END:VCARD`;
    },
  },
];

export default function QRGenerator() {
  const [inputText, setInputText] = useState("https://freedevtool.app");
  const [qrType, setQrType] = useState<QRType>("url");
  const [qrSize, setQrSize] = useState(300);
  const [qrUrl, setQrUrl] = useState("");
  const [error, setError] = useState("");

  const { toast } = useToast();

  const currentPreset = qrPresets.find(p => p.type === qrType) || qrPresets[0];

  // Generate QR code
  const generateQR = useCallback(() => {
    if (!inputText.trim()) {
      setError("Please enter some text to generate a QR code");
      setQrUrl("");
      return;
    }

    try {
      const formattedText = currentPreset.format(inputText.trim());
      const url = generateQRCode(formattedText, qrSize);
      setQrUrl(url);
      setError("");

      toast({
        title: "QR Code Generated",
        description: `Generated ${currentPreset.name} QR code successfully.`,
      });
    } catch {
      setError("Failed to generate QR code. Please check your input.");
      setQrUrl("");
    }
  }, [inputText, currentPreset, qrType, qrSize, toast]);

  // Auto-generate on input change
  useEffect(() => {
    if (inputText.trim()) {
      const timer = setTimeout(generateQR, 500);
      return () => clearTimeout(timer);
    }
    setQrUrl("");
    setError("");
  }, [inputText, qrType, qrSize, generateQR]);

  // Download QR code
  const downloadQR = async () => {
    if (!qrUrl) return;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your QR code is being downloaded.",
      });
    } catch {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code.",
        variant: "destructive",
      });
    }
  };

  // Copy QR code URL
  const copyQRUrl = () => {
    if (!qrUrl) return;

    navigator.clipboard
      .writeText(qrUrl)
      .then(() => {
        toast({
          title: "URL Copied",
          description: "QR code image URL copied to clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Failed to copy URL to clipboard.",
          variant: "destructive",
        });
      });
  };

  // Quick preset buttons
  const applyPreset = (preset: string) => {
    setInputText(preset);
  };

  const getQuickPresets = () => {
    const presets = {
      text: ["Hello World!", "DevTools Suite", "Generated with QR Tool"],
      url: [
        "https://freedevtool.app",
        "https://github.com",
        "https://google.com",
      ],
      email: ["contact@example.com", "support@company.com", "hello@domain.com"],
      phone: ["+1-555-0123", "+44-20-7946-0958", "+81-3-1234-5678"],
      sms: [
        "+1234567890:Hello!",
        "+1234567890:Meeting at 3pm",
        "+1234567890:Thanks!",
      ],
      wifi: [
        "HomeNetwork:password123:WPA",
        "OfficeWiFi:secure2024:WPA2",
        "GuestNet::nopass",
      ],
      vcard: [
        "John Smith:+1234567890:john@company.com",
        "Jane Doe:+0987654321:jane@email.com",
        "Bob Wilson::bob@domain.com",
      ],
    };

    return presets[qrType] || [];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          QR Code Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Generate QR codes for text, URLs, contact info, WiFi credentials, and
          more
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                QR Code Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qr-type">QR Code Type</Label>
                <Select
                  value={qrType}
                  onValueChange={(value: QRType) => setQrType(value)}
                >
                  <SelectTrigger data-testid="qr-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qrPresets.map(preset => (
                      <SelectItem key={preset.type} value={preset.type}>
                        <div className="flex items-center gap-2">
                          {preset.icon}
                          {preset.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="qr-size">QR Code Size</Label>
                <Select
                  value={qrSize.toString()}
                  onValueChange={value => setQrSize(parseInt(value))}
                >
                  <SelectTrigger data-testid="qr-size-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="150">150x150 px</SelectItem>
                    <SelectItem value="200">200x200 px</SelectItem>
                    <SelectItem value="300">300x300 px</SelectItem>
                    <SelectItem value="400">400x400 px</SelectItem>
                    <SelectItem value="500">500x500 px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="input-text">{currentPreset.name} Content</Label>
                <Textarea
                  id="input-text"
                  placeholder={currentPreset.placeholder}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  rows={4}
                  data-testid="qr-input"
                  showLineNumbers={true}
                  showStats={true}
                />
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="flex gap-2">
                <Button
                  onClick={generateQR}
                  className="flex-1"
                  disabled={!inputText.trim()}
                  data-testid="generate-qr"
                >
                  Generate QR Code
                </Button>
                {qrUrl ? (
                  <>
                    <Button
                      onClick={downloadQR}
                      variant="outline"
                      data-testid="download-qr"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={copyQRUrl}
                      variant="outline"
                      data-testid="copy-qr-url"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Quick Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {getQuickPresets().map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="justify-start text-left h-auto p-2"
                    data-testid={`preset-${index}`}
                  >
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 w-full">
                      {preset}
                    </code>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 aspect-square">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Generated QR Code"
                  className="max-w-full max-h-full"
                  data-testid="qr-code-image"
                />
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No QR Code Generated</p>
                  <p className="text-sm">
                    Enter text above to generate a QR code
                  </p>
                </div>
              )}
            </div>

            {qrUrl ? (
              <div className="mt-4 text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Size: {qrSize}x{qrSize} pixels
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500 break-all">
                  Content: {currentPreset.format(inputText)}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center my-8" />

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code Types & Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Supported QR Types:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>
                  • <strong>Plain Text:</strong> Any text content
                </li>
                <li>
                  • <strong>Website URL:</strong> Links to web pages
                </li>
                <li>
                  • <strong>Email:</strong> Email addresses with mailto links
                </li>
                <li>
                  • <strong>Phone Number:</strong> Clickable phone numbers
                </li>
                <li>
                  • <strong>SMS Message:</strong> Pre-filled text messages
                </li>
                <li>
                  • <strong>WiFi Network:</strong> Network credentials for easy
                  connection
                </li>
                <li>
                  • <strong>Contact Card:</strong> vCard format contact
                  information
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage Tips:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• QR codes auto-generate as you type</li>
                <li>• Larger sizes work better for complex content</li>
                <li>• Test QR codes with different apps and devices</li>
                <li>• WiFi format: NetworkName:Password:Security</li>
                <li>• SMS format: PhoneNumber:Message</li>
                <li>• Contact format: Name:Phone:Email</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8" />
    </div>
  );
}
