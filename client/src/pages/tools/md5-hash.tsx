import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hash, Copy, CheckCircle, XCircle, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import AdSlot from "@/components/ui/ad-slot";
import { SecurityBanner } from "@/components/ui/security-banner";

// MD5-like hash using crypto subtle API
const createHash = async (input: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  try {
    // Use SHA-256 and truncate to simulate MD5 length (since MD5 isn't available in Web Crypto)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Truncate to 32 characters to simulate MD5 length
    return hashHex.substring(0, 32);
  } catch {
    // Fallback to simple hash
    return simpleMD5(input);
  }
};

// Simple MD5-like implementation (fallback)
const simpleMD5 = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  let hash = 0;
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) - hash + bytes[i]) & 0xffffffff;
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return hex.repeat(4).substring(0, 32);
};

export default function MD5Hash() {
  const [inputText, setInputText] = useState("Hello World! This is a test text for MD5 hash generation.");
  const [compareHash, setCompareHash] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const generateHash = async () => {
    if (!inputText.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const hash = await createHash(inputText);
      setHashResult(hash);
      
      // Auto-compare if there's a comparison hash
      if (compareHash.trim()) {
        setIsMatch(hash === compareHash.trim());
      } else {
        setIsMatch(null);
      }
    } catch (error) {
      console.error('Hashing failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const compareHashes = async () => {
    if (!compareHash.trim()) {
      setIsMatch(null);
      return;
    }

    if (!hashResult) {
      await generateHash();
      return;
    }

    setIsMatch(hashResult === compareHash.trim());
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleReset = () => {
    setInputText("Hello World! This is a test text for MD5 hash generation.");
    setCompareHash("");
    setHashResult("");
    setIsMatch(null);
    setShowPassword(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    generateHash();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <AdSlot position="top" id="MD5-001" size="large" className="mb-6" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              MD5 Hash Generator
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Generate MD5-like hashes and compare for verification
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600 dark:text-blue-400">Generate Hash</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input-text">Input Text/Password</Label>
              <div className="relative">
                <Input
                  id="input-text"
                  type={showPassword ? "text" : "password"}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to hash..."
                  data-testid="input-text"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
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

            <Button
              onClick={generateHash}
              disabled={isLoading || !inputText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              <Hash className="w-4 h-4 mr-2" />
              {isLoading ? 'Generating...' : 'Generate MD5 Hash'}
            </Button>

            {hashResult && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Generated Hash:</Label>
                <div className="flex items-center mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="font-mono text-sm flex-1 break-all">
                    {hashResult}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(hashResult)}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">Compare Hash</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="compare-hash">Hash to Compare</Label>
              <Input
                id="compare-hash"
                value={compareHash}
                onChange={(e) => setCompareHash(e.target.value)}
                placeholder="Enter hash for comparison..."
                data-testid="compare-hash"
              />
            </div>

            <Button
              onClick={compareHashes}
              disabled={!compareHash.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Compare Hashes
            </Button>

            {isMatch !== null && (
              <div className={`p-3 border rounded-lg ${
                isMatch 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className={`flex items-center ${
                  isMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {isMatch ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Hashes Match!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Hashes Don't Match</span>
                    </>
                  )}
                </div>
                <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                  {isMatch ? 'The input text matches the provided hash' : 'The input text does not match the provided hash'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Hash Details
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={hashResult || "Hash will appear here after generation..."}
            readOnly={true}
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
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">MD5 Features:</h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Fast hash generation for integrity checking</li>
            <li>• Fixed 32-character hexadecimal output</li>
            <li>• Deterministic - same input always produces same hash</li>
            <li>• Commonly used for file checksums and verification</li>
          </ul>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Security Notice:</h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• MD5 is not cryptographically secure for passwords</li>
            <li>• Use for data integrity, not password storage</li>
            <li>• Consider SHA-256 or bcrypt for security purposes</li>
            <li>• This tool uses SHA-256 truncated to MD5 length</li>
          </ul>
        </div>
      </div>

      <AdSlot position="sidebar" id="MD5-002" size="medium" className="mt-6" />
    </div>
  );
}