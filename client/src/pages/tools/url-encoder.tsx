import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link, Unlink, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";
import { toolDefaults } from "@/data/defaults";

export default function URLEncoder() {
  const [plainText, setPlainText] = useState(toolDefaults.urlEncoder);
  const [encodedText, setEncodedText] = useState("");

  const encodeURL = useCallback(() => {
    try {
      const encoded = encodeURIComponent(plainText);
      setEncodedText(encoded);
    } catch (error: unknown) {
      console.error("Encoding error:", error);
      setEncodedText("Error: Invalid input for URL encoding");
    }
  }, [plainText]);

  const decodeURL = () => {
    try {
      const decoded = decodeURIComponent(encodedText);
      setPlainText(decoded);
    } catch (error: unknown) {
      setPlainText(
        `Error: Invalid input for URL decoding: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handlePlainTextChange = (value: string) => {
    setPlainText(value);
    if (encodedText) {
      setEncodedText("");
    }
  };

  const handleEncodedTextChange = (value: string) => {
    setEncodedText(value);
    if (plainText !== toolDefaults.urlEncoder) {
      setPlainText("");
    }
  };

  const handleReset = () => {
    setPlainText(toolDefaults.urlEncoder);
    setEncodedText("");
  };

  useEffect(() => {
    encodeURL();
  }, [encodeURL]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              URL Encoder/Decoder
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              URL encode and decode strings for safe URL transmission
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <div className="mb-6 flex gap-3">
        <Button
          onClick={encodeURL}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Link className="w-4 h-4 mr-2" />
          Encode URL
        </Button>
        <Button
          onClick={decodeURL}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Unlink className="w-4 h-4 mr-2" />
          Decode URL
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">
              Plain Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={plainText}
              onChange={e => handlePlainTextChange(e.target.value)}
              placeholder="Enter text to URL encode..."
              data-testid="plain-text-input"
              className="min-h-[400px] font-mono text-sm"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">
              URL Encoded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={encodedText}
              onChange={e => handleEncodedTextChange(e.target.value)}
              placeholder="URL encoded text will appear here..."
              data-testid="encoded-text-output"
              className="min-h-[400px] font-mono text-sm"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          URL Encoding Examples:
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>
            <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
              Space
            </span>{" "}
            →{" "}
            <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
              %20
            </span>
          </div>
          <div>
            <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
              @
            </span>{" "}
            →{" "}
            <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
              %40
            </span>
          </div>
          <div>
            <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
              &
            </span>{" "}
            →{" "}
            <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
              %26
            </span>
          </div>
          <div>
            <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
              =
            </span>{" "}
            →{" "}
            <span className="font-mono bg-white dark:bg-gray-800 px-1 rounded">
              %3D
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
