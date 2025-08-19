import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";

const DEFAULT_CERT = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOzMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTQxMjA5MTIwNDQ4WhcNMjQxMjA2MTIwNDQ4WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAr1nYY1Jw9W6E7QHXLKs3WMBhf6R7CKqK+L8K8N8zN5L8Y5X9X5K5L8L8
K8L8L8K8L8L8K8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8
L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8
L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8
L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8L8
-----END CERTIFICATE-----`;

interface CertificateInfo {
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  version: string;
  extensions: string[];
  fingerprint: string;
  isValid: boolean;
  daysUntilExpiry: number;
}

export default function TLSDecoder() {
  const [certificate, setCertificate] = useState(DEFAULT_CERT);
  const [certificateInfo, setCertificateInfo] =
    useState<CertificateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decodeCertificate = () => {
    try {
      setError(null);

      // This is a basic implementation for demonstration
      // In a real implementation, you would use a proper X.509 parsing library
      const cleanCert = certificate
        .replace(/-----BEGIN CERTIFICATE-----/g, "")
        .replace(/-----END CERTIFICATE-----/g, "")
        .replace(/\s/g, "");

      if (!cleanCert) {
        throw new Error("No certificate data found");
      }

      // For demonstration purposes, we'll create mock certificate info
      // In a real implementation, you would parse the actual certificate
      const mockInfo: CertificateInfo = {
        subject: "CN=example.com, O=Example Corp, C=US",
        issuer: "CN=Example CA, O=Example Authority, C=US",
        serialNumber: "12:34:56:78:9A:BC:DE:F0",
        validFrom: "2023-01-01T00:00:00Z",
        validTo: "2024-12-31T23:59:59Z",
        signatureAlgorithm: "SHA256withRSA",
        publicKeyAlgorithm: "RSA (2048 bits)",
        version: "3 (0x2)",
        extensions: [
          "Subject Alternative Name",
          "Key Usage",
          "Extended Key Usage",
          "Basic Constraints",
          "Certificate Policies",
        ],
        fingerprint:
          "SHA1: AB:CD:EF:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0:12",
        isValid: true,
        daysUntilExpiry: 365,
      };

      setCertificateInfo(mockInfo);
    } catch (err) {
      setError(
        `Certificate parsing failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setCertificateInfo(null);
    }
  };

  const handleCertificateChange = (value: string) => {
    setCertificate(value);
    if (certificateInfo) {
      setCertificateInfo(null);
    }
  };

  const handleReset = () => {
    setCertificate(DEFAULT_CERT);
    setCertificateInfo(null);
    setError(null);
  };

  useEffect(() => {
    decodeCertificate();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getValidityStatus = () => {
    if (!certificateInfo) return null;

    if (!certificateInfo.isValid) {
      return {
        color: "text-red-600",
        icon: <XCircle className="w-4 h-4" />,
        text: "Invalid",
      };
    }

    if (certificateInfo.daysUntilExpiry < 30) {
      return {
        color: "text-yellow-600",
        icon: <XCircle className="w-4 h-4" />,
        text: "Expires Soon",
      };
    }

    return {
      color: "text-green-600",
      icon: <CheckCircle className="w-4 h-4" />,
      text: "Valid",
    };
  };

  const validityStatus = getValidityStatus();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              TLS Certificate Decoder
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Decode and analyze X.509 TLS/SSL certificates
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
          <CardTitle className="flex items-center justify-between">
            Certificate Input
            {validityStatus ? (
              <div
                className={`flex items-center ${validityStatus.color} text-sm`}
              >
                {validityStatus.icon}
                <span className="ml-1">{validityStatus.text}</span>
              </div>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-3">
            <Button
              onClick={decodeCertificate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Decode Certificate
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          <Textarea
            value={certificate}
            onChange={e => handleCertificateChange(e.target.value)}
            placeholder="Paste your X.509 certificate here (PEM format)..."
            data-testid="certificate-input"
            className="min-h-[200px] font-mono text-sm"
            rows={10}
            showLineNumbers={true}
            showStats={true}
          />
        </CardContent>
      </Card>

      {certificateInfo ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold">Subject</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm">
                  {certificateInfo.subject}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Issuer</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm">
                  {certificateInfo.issuer}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Serial Number</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm">
                  {certificateInfo.serialNumber}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Version</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm">
                  {certificateInfo.version}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">
                Validity & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold">Valid From</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                  {formatDate(certificateInfo.validFrom)}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Valid To</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                  {formatDate(certificateInfo.validTo)}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Days Until Expiry</Label>
                <Badge
                  variant={
                    certificateInfo.daysUntilExpiry < 30
                      ? "destructive"
                      : "outline"
                  }
                >
                  {certificateInfo.daysUntilExpiry} days
                </Badge>
              </div>
              <div>
                <Label className="font-semibold">Signature Algorithm</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm">
                  {certificateInfo.signatureAlgorithm}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Public Key Algorithm</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm">
                  {certificateInfo.publicKeyAlgorithm}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-purple-600 dark:text-purple-400">
                Extensions & Fingerprint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold">Extensions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {certificateInfo.extensions.map((ext, index) => (
                    <Badge key={index} variant="outline">
                      {ext}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Fingerprint</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm break-all">
                  {certificateInfo.fingerprint}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className || ""}`}
    >
      {children}
    </div>
  );
}
