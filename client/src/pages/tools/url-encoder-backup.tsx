import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { encodeURL, decodeURL } from "@/lib/encoders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, Unlink, ArrowRightLeft, RotateCcw } from "lucide-react";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import { useToolDefault } from "@/hooks/use-tool-default";

const defaultFields = {
  plainText: "Hello World! This is a test URL parameter with special characters: @#$%^&*()+={}[]|\\:;\"'<>?,./`~",
  encodedText: ""
};

export default function UrlEncoder() {
  const { fields, updateField, resetFields } = usePersistentForm('url-encoder', defaultFields);
  const [error, setError] = useState<string | null>(null);

  const encode = () => {
    try {
      const result = encodeURL(fields.plainText);
      updateField('encodedText', result);
      setError(null);
    } catch {
      setError('Encoding failed');
    }
  };

  const decode = () => {
    try {
      const result = decodeURL(fields.encodedText);
      updateField('plainText', result);
      setError(null);
    } catch {
      setError('Decoding failed');
    }
  };

  const swapContent = () => {
    const temp = fields.plainText;
    updateField('plainText', fields.encodedText);
    updateField('encodedText', temp);
    setError(null);
  };

  // Execute URL encoding with default value on component mount
  useToolDefault(() => {
    encode();
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          URL Encoder/Decoder
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Encode and decode URLs and URL parameters
        </p>
      </div>

      {error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert> : null}

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button onClick={encode} data-testid="url-encode-button">
          <Link className="w-4 h-4 mr-2" />
          Encode
        </Button>
        <Button onClick={decode} variant="outline" data-testid="url-decode-button">
          <Unlink className="w-4 h-4 mr-2" />
          Decode
        </Button>
        <Button onClick={swapContent} variant="outline" data-testid="url-swap-button">
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Swap
        </Button>
        <Button onClick={resetFields} variant="outline" data-testid="reset-button">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plain Text / URL</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={fields.plainText}
              onChange={(value) => updateField('plainText', value)}
              placeholder="Enter text or URL to encode..."
              data-testid="url-plain-text"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>URL Encoded</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={fields.encodedText}
              onChange={(value) => updateField('encodedText', value)}
              placeholder="Enter URL encoded text to decode..."
              data-testid="url-encoded-text"
              className="min-h-[400px]"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
