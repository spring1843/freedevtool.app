import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { decodeJWT } from "@/lib/encoders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { usePersistentForm } from "@/hooks/use-persistent-state";

const DEFAULT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoder() {
  const { fields, updateField, resetFields } = usePersistentForm('jwt-decoder', {
    token: DEFAULT_TOKEN,
    header: "",
    payload: "",
    signature: "",
    isValid: false,
    error: null as string | null
  });

  const decode = () => {
    const result = decodeJWT(fields.token);
    
    if (result.isValid) {
      updateField('header', JSON.stringify(result.header, null, 2));
      updateField('payload', JSON.stringify(result.payload, null, 2));
      updateField('signature', result.signature);
      updateField('isValid', true);
      updateField('error', null);
    } else {
      updateField('header', "");
      updateField('payload', "");
      updateField('signature', "");
      updateField('isValid', false);
      updateField('error', result.error || "Invalid JWT token");
    }
  };

  const handleTokenChange = (value: string) => {
    updateField('token', value);
    // Clear results when token changes
    updateField('header', "");
    updateField('payload', "");
    updateField('signature', "");
    updateField('isValid', false);
    updateField('error', null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          JWT Decoder
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Decode and validate JSON Web Tokens (JWT)
        </p>
      </div>

      {fields.error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {fields.error}
          </AlertDescription>
        </Alert> : null}

      {/* Token Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            JWT Token
            <div className="ml-auto flex items-center">
              {fields.isValid ? (
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
              <div className="flex gap-2">
                <Button onClick={decode} size="sm" data-testid="decode-jwt-button">
                  <Key className="w-4 h-4 mr-2" />
                  Decode
                </Button>
                <Button onClick={resetFields} size="sm" variant="outline" data-testid="reset-jwt-button">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TextEditorWithLines
            value={fields.token}
            onChange={handleTokenChange}
            placeholder="Paste your JWT token here..."
            data-testid="jwt-token-input"
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Decoded Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">Header</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={fields.header}
              onChange={() => {}}
              disabled={true}
              placeholder="Decoded header will appear here..."
              data-testid="jwt-header-output"
              className="min-h-[300px]"
            />
          </CardContent>
        </Card>

        {/* Payload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">Payload</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={fields.payload}
              onChange={() => {}}
              disabled={true}
              placeholder="Decoded payload will appear here..."
              data-testid="jwt-payload-output"
              className="min-h-[300px]"
            />
          </CardContent>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600 dark:text-purple-400">Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <TextEditorWithLines
              value={fields.signature}
              onChange={() => {}}
              disabled={true}
              placeholder="Signature will appear here..."
              data-testid="jwt-signature-output"
              className="min-h-[300px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* JWT Structure Info */}
      <div className="mt-8">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">JWT Structure</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">Header</span>
                <span>Contains the token type and signing algorithm</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs">Payload</span>
                <span>Contains the claims (user data and metadata)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-mono bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded text-xs">Signature</span>
                <span>Used to verify the token hasn't been tampered with</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
