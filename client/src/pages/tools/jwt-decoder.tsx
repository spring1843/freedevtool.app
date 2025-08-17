import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, CheckCircle, XCircle } from "lucide-react";
import { SecurityBanner } from "@/components/ui/security-banner";
import { useState, useEffect } from "react";
import { ToolButton, ResetButton } from "@/components/ui/tool-button";

const DEFAULT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JWTDecoder() {
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decodeToken = () => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        setError(
          "Invalid JWT format: Token must have 3 parts separated by dots"
        );
        setIsValid(false);
        return;
      }

      const [headerPart, payloadPart, signaturePart] = parts;

      // Decode header
      const decodedHeader = JSON.parse(
        atob(headerPart.replace(/-/g, "+").replace(/_/g, "/"))
      );
      setHeader(JSON.stringify(decodedHeader, null, 2));

      // Decode payload
      const decodedPayload = JSON.parse(
        atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))
      );
      setPayload(JSON.stringify(decodedPayload, null, 2));

      // Set signature (base64url encoded)
      setSignature(signaturePart);

      setIsValid(true);
      setError(null);
    } catch (err) {
      setError("Invalid JWT: Unable to decode token");
      setIsValid(false);
      setHeader("");
      setPayload("");
      setSignature("");
    }
  };

  const handleTokenChange = (value: string) => {
    setToken(value);
    if (header || payload || signature) {
      setHeader("");
      setPayload("");
      setSignature("");
      setIsValid(false);
    }
  };

  const handleReset = () => {
    setToken(DEFAULT_TOKEN);
    setHeader("");
    setPayload("");
    setSignature("");
    setIsValid(false);
    setError(null);
  };

  useEffect(() => {
    decodeToken();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              JWT Decoder
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Decode and validate JSON Web Tokens (JWT)
            </p>
          </div>
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            JWT Token
            <div className="ml-auto flex items-center">
              {isValid ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Valid
                </div>
              ) : (
                <div className="flex items-center text-red-600 text-sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  Invalid
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-3">
            <ToolButton
              variant="custom"
              onClick={decodeToken}
              icon={<Key className="w-4 h-4 mr-2" />}
              tooltip="Decode JWT token"
            >
              Decode
            </ToolButton>
            <ResetButton
              onClick={handleReset}
              tooltip="Reset to default token"
            />
          </div>
          <Textarea
            value={token}
            onChange={e => handleTokenChange(e.target.value)}
            placeholder="Paste your JWT token here..."
            data-testid="jwt-token-input"
            className="min-h-[100px] font-mono text-sm"
            rows={5}
            showLineNumbers={true}
            showStats={true}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">
              Header
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={header}
              readOnly={true}
              placeholder="Decoded header will appear here..."
              data-testid="jwt-header-output"
              className="min-h-[300px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={15}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">
              Payload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={payload}
              readOnly={true}
              placeholder="Decoded payload will appear here..."
              data-testid="jwt-payload-output"
              className="min-h-[300px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={15}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600 dark:text-purple-400">
              Signature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={signature}
              readOnly={true}
              placeholder="Signature will appear here..."
              data-testid="jwt-signature-output"
              className="min-h-[300px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
              rows={15}
              showLineNumbers={true}
              showStats={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
