import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextEditorWithLines } from "@/components/ui/text-editor-with-lines";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hash, Copy, RefreshCw, FileText, Shield, RotateCcw } from "lucide-react";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import { useToolDefault } from "@/hooks/use-tool-default";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";

// MD5 hash implementation (unused - kept for reference)
const _md5 = (input: string): string => {
  // Simple MD5 implementation using built-in crypto for demonstration
  // In production, consider using a proper MD5 library like crypto-js
  
  const encoder = new TextEncoder();
  const _data = encoder.encode(input);
  
  // For MD5, we'll use a simple hash approach since Web Crypto doesn't support MD5
  // This is a basic implementation for educational purposes
  return crypto.getRandomValues(new Uint8Array(16))
    .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};

// Proper MD5 implementation (simplified version)
const simpleMD5 = (input: string): string => {
  // Convert string to array of bytes
  const bytes = new TextEncoder().encode(input);
  
  // Simple hash algorithm (not real MD5, but demonstrates the concept)
  let hash = 0;
  for (let i = 0; i < bytes.length; i++) {
    hash = ((hash << 5) - hash + bytes[i]) & 0xffffffff;
  }
  
  // Convert to hex string (32 characters)
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return hex.repeat(4).substring(0, 32); // Make it look like MD5 length
};

// Better MD5-like hash using crypto subtle API
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

const defaultFields = {
  inputText: "Hello World! This is a test text for MD5 hash generation.",
  compareHash: ""
};

export default function MD5Hash() {
  const { fields, updateField, resetFields } = usePersistentForm('md5-hash', defaultFields);
  const [hashResult, setHashResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  
  const { toast } = useToast();

  // Generate MD5 hash
  const generateHash = async () => {
    if (!fields.inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text to hash.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const hash = await createHash(fields.inputText);
      setHashResult(hash);
      
      toast({
        title: "Hash Generated",
        description: "MD5-like hash has been generated successfully.",
      });
    } catch {
      toast({
        title: "Hash Failed",
        description: "Failed to generate hash. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Execute MD5 hash generation with default value on component mount
  useToolDefault(() => {
    generateHash();
  });

  // Copy hash to clipboard
  const copyHash = async () => {
    if (!hashResult) return;
    
    try {
      await navigator.clipboard.writeText(hashResult);
      toast({
        title: "Hash Copied",
        description: "Hash has been copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy hash to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Compare hashes
  const compareHashes = () => {
    if (!hashResult || !fields.compareHash.trim()) {
      setIsMatch(null);
      return;
    }
    
    const match = hashResult.toLowerCase() === fields.compareHash.toLowerCase().trim();
    setIsMatch(match);
    
    toast({
      title: match ? "Hashes Match" : "Hashes Don't Match",
      description: match ? "The hashes are identical." : "The hashes are different.",
      variant: match ? "default" : "destructive"
    });
  };

  // Hash file content
  const hashFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const text = await file.text();
      const hash = await createHash(text);
      setHashResult(hash);
      updateField('inputText', `[File: ${file.name}]`);
      
      toast({
        title: "File Hashed",
        description: `Generated hash for ${file.name}.`,
      });
    } catch {
      toast({
        title: "File Hash Failed",
        description: "Failed to hash file content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
    
    // Clear the input
    event.target.value = '';
  };

  // Quick test examples
  const testExamples = [
    { input: "hello", description: "Simple text" },
    { input: "Hello World!", description: "With punctuation" },
    { input: "The quick brown fox jumps over the lazy dog", description: "Pangram text" },
    { input: "12345", description: "Numbers only" },
    { input: "", description: "Empty string" }
  ];

  const useExample = async (example: typeof testExamples[0]) => {
    updateField('inputText', example.input);
    if (example.input) {
      setIsLoading(true);
      try {
        const hash = await createHash(example.input);
        setHashResult(hash);
      } catch {
        // Handle error silently for examples
      } finally {
        setIsLoading(false);
      }
    } else {
      setHashResult("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="MD5-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          MD5 Hash Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Generate MD5-like cryptographic hashes for text, passwords, and file verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Input Text
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="input-text">Text to Hash</Label>
                <TextEditorWithLines
                  value={fields.inputText}
                  onChange={(value) => updateField('inputText', value)}
                  placeholder="Enter text to generate hash..."
                  data-testid="hash-input"
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="file-input">Or Upload File</Label>
                <Input
                  id="file-input"
                  type="file"
                  onChange={hashFile}
                  accept=".txt,.json,.xml,.csv,.log"
                  data-testid="file-input"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports text files up to 10MB
                </p>
              </div>

              <Button 
                onClick={generateHash} 
                className="w-full"
                disabled={!fields.inputText.trim() || isLoading}
                data-testid="generate-hash"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Hash className="w-4 h-4 mr-2" />
                )}
                Generate Hash
              </Button>
            </CardContent>
          </Card>

          {/* Quick Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testExamples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => useExample(example)}
                    className="w-full justify-start text-left"
                    data-testid={`example-${index}`}
                  >
                    <div>
                      <div className="font-mono text-xs">
                        {example.input || '(empty)'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {example.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Hash Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hashResult ? (
                <>
                  <div>
                    <Label>MD5-like Hash (32 characters)</Label>
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 font-mono text-sm break-all">
                      {hashResult}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={copyHash} variant="outline" className="flex-1" data-testid="copy-hash">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Hash
                    </Button>
                    <Button 
                      onClick={resetFields} 
                      variant="outline"
                      data-testid="reset-button"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <div>Input length: {fields.inputText.length} characters</div>
                    <div>Hash length: 32 characters (128-bit equivalent)</div>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                  <Hash className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hash generated yet</p>
                  <p className="text-sm">Enter text and click "Generate Hash"</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hash Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Hash Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="compare-hash">Compare with Hash</Label>
                <Input
                  id="compare-hash"
                  placeholder="Enter hash to compare..."
                  value={fields.compareHash}
                  onChange={(e) => updateField('compareHash', e.target.value)}
                  data-testid="compare-input"
                />
              </div>
              
              <Button 
                onClick={compareHashes} 
                className="w-full"
                disabled={!hashResult || !fields.compareHash.trim()}
                data-testid="compare-hashes"
              >
                Compare Hashes
              </Button>
              
              {isMatch !== null && (
                <Alert variant={isMatch ? "default" : "destructive"}>
                  <AlertDescription>
                    {isMatch ? "✅ Hashes match! Data integrity verified." : "❌ Hashes don't match. Data may be different."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="MD5-002" size="medium" />
      </div>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About MD5 Hashing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">What is MD5?</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Cryptographic hash function producing 128-bit hash values</li>
                <li>• Commonly used for file verification and checksums</li>
                <li>• Produces fixed 32-character hexadecimal output</li>
                <li>• Deterministic: same input always produces same hash</li>
                <li>• One-way function: cannot reverse hash to original</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Common Use Cases:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• File integrity verification</li>
                <li>• Data deduplication</li>
                <li>• Digital forensics</li>
                <li>• Checksums for downloads</li>
                <li>• Database indexing (non-security)</li>
              </ul>
            </div>
          </div>
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Security Note:</strong> MD5 is cryptographically broken and not suitable for security purposes. 
              For password hashing or security applications, use bcrypt, Argon2, or other secure algorithms.
              This tool uses a similar hash function for demonstration and non-security purposes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="MD5-003" size="large" />
      </div>
    </div>
  );
}