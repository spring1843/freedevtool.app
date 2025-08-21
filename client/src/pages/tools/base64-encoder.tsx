import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { encodeBase64, decodeBase64 } from "@/lib/encoders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Unlock, ArrowRightLeft } from "lucide-react";
import { SecurityBanner } from "@/components/ui/security-banner";
import { useState, useEffect, useCallback } from "react";
import { ToolButton, ResetButton } from "@/components/ui/tool-button";
import { DEFAULT_BASE64 } from "@/data/defaults";

export default function Base64Encoder() {
  const [plainText, setPlainText] = useState(DEFAULT_BASE64);
  const [encodedText, setEncodedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const encode = useCallback(() => {
    try {
      const result = encodeBase64(plainText);
      setEncodedText(result);
      setError(null);
    } catch {
      setError("Encoding failed");
    }
  }, [plainText]);

  const decode = () => {
    try {
      const result = decodeBase64(encodedText);
      setPlainText(result);
      setError(null);
    } catch {
      setError("Decoding failed");
    }
  };

  const swapContent = () => {
    const temp = plainText;
    setPlainText(encodedText);
    setEncodedText(temp);
    setError(null);
  };

  const handlePlainTextChange = (value: string) => {
    setPlainText(value);
    if (encodedText) {
      setEncodedText("");
    }
  };

  const handleEncodedTextChange = (value: string) => {
    setEncodedText(value);
    if (plainText !== DEFAULT_BASE64) {
      setPlainText(DEFAULT_BASE64);
    }
  };

  const handleReset = () => {
    setPlainText(DEFAULT_BASE64);
    setEncodedText("");
    setError(null);
  };

  // Execute encoding with default value on component mount
  useEffect(() => {
    encode();
  }, [encode]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Base64 Encoder/Decoder
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-slate-600 dark:text-slate-400">
            Encode and decode text using Base64 encoding
          </p>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      {error ? (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-3">
        <ToolButton
          variant="custom"
          onClick={encode}
          icon={<Lock className="w-4 h-4 mr-2" />}
          tooltip="Encode plain text to Base64"
        >
          Encode
        </ToolButton>
        <ToolButton
          variant="custom"
          onClick={decode}
          icon={<Unlock className="w-4 h-4 mr-2" />}
          tooltip="Decode Base64 to plain text"
        >
          Decode
        </ToolButton>
        <ToolButton
          variant="custom"
          onClick={swapContent}
          icon={<ArrowRightLeft className="w-4 h-4 mr-2" />}
          tooltip="Swap content between input and output"
        >
          Swap
        </ToolButton>
        <ResetButton
          onClick={handleReset}
          tooltip="Reset to default text example"
        />
      </div>

      {/* Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plain Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={plainText}
              onChange={e => handlePlainTextChange(e.target.value)}
              placeholder="Enter text to encode..."
              data-testid="base64-plain-text"
              className="min-h-[400px] font-mono text-sm"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base64 Encoded</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={encodedText}
              onChange={e => handleEncodedTextChange(e.target.value)}
              placeholder="Enter Base64 encoded text to decode..."
              data-testid="base64-encoded-text"
              className="min-h-[400px] font-mono text-sm"
              rows={20}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
