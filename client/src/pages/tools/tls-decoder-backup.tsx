import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { decodeTLSCertificate } from "@/lib/encoders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { usePersistentForm } from "@/hooks/use-persistent-state";

const DEFAULT_CERT = `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUX7fDhgcPQyEXJ7UqQQ7JKqJ1234567890ABCDEFGHIJK
LMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz1234567890A
BCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz12
34567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrs
TUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghi
jklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
-----END CERTIFICATE-----`;

export default function TlsDecoder() {
  const { fields, updateField, resetFields } = usePersistentForm('tls-decoder', {
    certificate: DEFAULT_CERT,
    certificateInfo: null as any,
    error: null as string | null
  });

  const { certificate, certificateInfo, error } = fields;

  const decode = () => {
    const result = decodeTLSCertificate(certificate);
    
    if (result.isValid) {
      updateField('certificateInfo', result);
      updateField('error', null);
    } else {
      updateField('certificateInfo', null);
      updateField('error', result.error || "Invalid certificate");
    }
  };

  const handleCertificateChange = (value: string) => {
    updateField('certificate', value);
    // Clear results when certificate changes
    if (certificateInfo) {
      updateField('certificateInfo', null);
      updateField('error', null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          TLS Certificate Decoder
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Decode and analyze TLS/SSL certificates
        </p>
      </div>

      {error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert> : null}

      {/* Certificate Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            Certificate (PEM Format)
            <div className="ml-auto flex gap-2">
              <Button onClick={decode} size="sm" data-testid="decode-cert-button">
                <Shield className="w-4 h-4 mr-2" />
                Decode Certificate
              </Button>
              <Button onClick={resetFields} size="sm" variant="outline" data-testid="reset-tls-button">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TextEditorWithLines
            value={certificate}
            onChange={handleCertificateChange}
            placeholder="Paste your PEM encoded certificate here..."
            data-testid="tls-certificate-input"
            className="min-h-[200px]"
          />
        </CardContent>
      </Card>

      {/* Certificate Information */}
      {certificateInfo ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Certificate Information
                {certificateInfo.isValid ? (
                  <div className="flex items-center text-green-600 text-sm ml-auto">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Valid Format
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 text-sm ml-auto">
                    <XCircle className="w-4 h-4 mr-1" />
                    Invalid
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </div>
                <code className="text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded block">
                  {certificateInfo.subject}
                </code>
              </div>
              
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Issuer
                </div>
                <code className="text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded block">
                  {certificateInfo.issuer}
                </code>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Serial Number
                </div>
                <code className="text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded block">
                  {certificateInfo.serialNumber}
                </code>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Algorithm
                </div>
                <code className="text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded block">
                  {certificateInfo.algorithm}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Validity and Security */}
          <Card>
            <CardHeader>
              <CardTitle>Validity & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Valid From
                </div>
                <code className="text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded block">
                  {new Date(certificateInfo.validFrom).toLocaleString()}
                </code>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Valid To
                </div>
                <code className="text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded block">
                  {new Date(certificateInfo.validTo).toLocaleString()}
                </code>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Fingerprint (SHA-1)
                </div>
                <code className="text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded block break-all">
                  {certificateInfo.fingerprint}
                </code>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Certificate Status
                  </span>
                  <div className={`flex items-center text-sm ${
                    new Date() < new Date(certificateInfo.validTo) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {new Date() < new Date(certificateInfo.validTo) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Valid
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        Expired
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> : null}

      {/* Information */}
      <div className="mt-8">
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="text-amber-600 dark:text-amber-400 mt-1 h-5 w-5" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Note</h4>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This is a simplified certificate parser for demonstration purposes. 
                  In production, you should use a proper cryptographic library for 
                  full certificate validation and parsing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
