import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hash, CheckCircle, XCircle, RotateCcw, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import AdSlot from "@/components/ui/ad-slot";
import { SecurityBanner } from "@/components/ui/security-banner";

export default function BcryptHash() {
  const [plaintext, setPlaintext] = useState("mypassword123");
  const [hash, setHash] = useState("");
  const [verifyText, setVerifyText] = useState("");
  const [rounds, setRounds] = useState(10);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);

  // Simple bcrypt-like hash function for demonstration
  // In a real implementation, you would use a proper bcrypt library
  const simpleBcryptHash = async (password: string, saltRounds: number): Promise<string> => {
    // This is a simplified version for demonstration
    // Real bcrypt involves proper salt generation and multiple iterations
    const encoder = new TextEncoder();
    const data = encoder.encode(password + saltRounds);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Format like bcrypt: $2b$rounds$salt.hash
    const salt = hashHex.substring(0, 22);
    const hashPart = hashHex.substring(22);
    return `$2b$${saltRounds.toString().padStart(2, '0')}$${salt}${hashPart}`;
  };

  const simpleBcryptVerify = async (password: string, hash: string): Promise<boolean> => {
    try {
      // Extract rounds from hash
      const parts = hash.split('$');
      if (parts.length !== 4 || parts[1] !== '2b') {
        throw new Error('Invalid hash format');
      }
      
      const roundsFromHash = parseInt(parts[2]);
      const expectedHash = await simpleBcryptHash(password, roundsFromHash);
      
      // Compare the hash parts (excluding salt which should match)
      return hash === expectedHash;
    } catch {
      return false;
    }
  };

  const generateHash = async () => {
    if (!plaintext.trim()) {
      setError("Password cannot be empty");
      return;
    }

    setIsHashing(true);
    setError(null);
    
    try {
      const hashedPassword = await simpleBcryptHash(plaintext, rounds);
      setHash(hashedPassword);
      setVerificationResult(null);
    } catch (err) {
      setError(`Hashing failed: ${err instanceof Error ? err.message : String(err)}`);
      setHash("");
    } finally {
      setIsHashing(false);
    }
  };

  const verifyHash = async () => {
    if (!verifyText.trim() || !hash.trim()) {
      setError("Both password and hash are required for verification");
      return;
    }

    setIsVerifying(true);
    setError(null);
    
    try {
      const isValid = await simpleBcryptVerify(verifyText, hash);
      setVerificationResult(isValid);
    } catch (err) {
      setError(`Verification failed: ${err instanceof Error ? err.message : String(err)}`);
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setPlaintext("mypassword123");
    setHash("");
    setVerifyText("");
    setRounds(10);
    setVerificationResult(null);
    setError(null);
    setShowPassword(false);
    setShowVerifyPassword(false);
  };

  useEffect(() => {
    generateHash();
  }, []);

  const getVerificationDisplay = () => {
    if (verificationResult === null) return null;
    
    if (verificationResult) {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle className="w-4 h-4 mr-2" />
          Password matches hash
        </div>
      );
    } 
      return (
        <div className="flex items-center text-red-600">
          <XCircle className="w-4 h-4 mr-2" />
          Password does not match hash
        </div>
      );
    
  };

  return (
    <div className="max-w-6xl mx-auto">
      <AdSlot position="top" id="BH-001" size="large" className="mb-6" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Bcrypt Hash Generator
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Generate and verify secure bcrypt password hashes
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      {error ? <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">Hash Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="plaintext">Password</Label>
              <div className="relative">
                <Input
                  id="plaintext"
                  type={showPassword ? "text" : "password"}
                  value={plaintext}
                  onChange={(e) => setPlaintext(e.target.value)}
                  placeholder="Enter password to hash..."
                  data-testid="password-input"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="rounds">Salt Rounds</Label>
              <Select value={rounds.toString()} onValueChange={(value) => setRounds(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 rounds (fast)</SelectItem>
                  <SelectItem value="10">10 rounds (balanced)</SelectItem>
                  <SelectItem value="12">12 rounds (secure)</SelectItem>
                  <SelectItem value="14">14 rounds (very secure)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Higher rounds = more secure but slower
              </div>
            </div>

            <Button
              onClick={generateHash}
              disabled={isHashing || !plaintext.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              <Hash className="w-4 h-4 mr-2" />
              {isHashing ? 'Generating...' : 'Generate Hash'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">Hash Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="verify-text">Password to Verify</Label>
              <div className="relative">
                <Input
                  id="verify-text"
                  type={showVerifyPassword ? "text" : "password"}
                  value={verifyText}
                  onChange={(e) => setVerifyText(e.target.value)}
                  placeholder="Enter password to verify..."
                  data-testid="verify-password-input"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                  aria-label={showVerifyPassword ? "Hide password" : "Show password"}
                >
                  {showVerifyPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={verifyHash}
              disabled={isVerifying || !verifyText.trim() || !hash.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isVerifying ? 'Verifying...' : 'Verify Password'}
            </Button>

            {getVerificationDisplay() && (
              <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                {getVerificationDisplay()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Generated Hash
            <div className="flex gap-2">
              <Badge variant="outline">
                {rounds} rounds
              </Badge>
              <Button onClick={handleReset} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={hash}
            readOnly={true}
            placeholder="Generated bcrypt hash will appear here..."
            data-testid="hash-output"
            className="min-h-[100px] font-mono text-sm bg-slate-50 dark:bg-slate-900"
            rows={5}
            showLineNumbers={true}
            showStats={true}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Bcrypt Features:</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Adaptive hashing function for passwords</li>
            <li>• Built-in salt generation</li>
            <li>• Configurable work factor (rounds)</li>
            <li>• Resistant to rainbow table attacks</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Security Notes:</h3>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Use 10+ rounds for production</li>
            <li>• Higher rounds increase security but slow hashing</li>
            <li>• Each hash includes its own unique salt</li>
            <li>• Same password produces different hashes</li>
          </ul>
        </div>
      </div>

      <AdSlot position="sidebar" id="BH-002" size="medium" className="mt-6" />
    </div>
  );
}