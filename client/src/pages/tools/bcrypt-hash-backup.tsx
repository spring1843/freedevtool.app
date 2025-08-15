
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Copy, RefreshCw, Eye, EyeOff, Lock, Unlock, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePersistentForm } from "@/hooks/use-persistent-state";
import AdSlot from "@/components/ui/ad-slot";

// Simple bcrypt-like implementation using Web Crypto API
const generateSalt = (rounds: number): string => {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const saltString = Array.from(saltBytes, byte => byte.toString(36)).join('').slice(0, 22);
  return `$2b$${rounds.toString().padStart(2, '0')}$${saltString}`;
};

const bcryptLike = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password + salt);
  
  try {
    // Use PBKDF2 to simulate bcrypt behavior
    const key = await crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const iterations = 2 ** parseInt(salt.split('$')[2], 10) || 4096;
    const saltBytes = encoder.encode(salt.slice(-22));
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations,
        hash: 'SHA-256'
      },
      key,
      256
    );
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '.')
      .replace(/=/g, '')
      .slice(0, 31);
    
    return salt + hashBase64;
  } catch {
    // Fallback simple hash
    let hash = 0;
    const combined = password + salt;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash + combined.charCodeAt(i)) & 0xffffffff;
    }
    const hashHex = (hash >>> 0).toString(16).padStart(8, '0');
    return salt + hashHex.repeat(4).slice(0, 31);
  }
};

const verifyBcryptLike = async (password: string, hash: string): Promise<boolean> => {
  try {
    const parts = hash.split('$');
    if (parts.length < 4) return false;
    
    const salt = `${parts.slice(0, 3).join('$')  }$${  parts[3]}`;
    const newHash = await bcryptLike(password, salt);
    
    return newHash === hash;
  } catch {
    return false;
  }
};

export default function BCryptHash() {
  const { fields, updateField, resetFields } = usePersistentForm('bcrypt-hash', {
    password: "",
    hashResult: "",
    verifyPassword: "",
    verifyHash: "",
    verifyResult: null as boolean | null,
    rounds: 10,
    isHashing: false,
    isVerifying: false,
    showPassword: false,
    showVerifyPassword: false
  });

  const { password, hashResult, verifyPassword, verifyHash, verifyResult, rounds, isHashing, isVerifying, showPassword, showVerifyPassword } = fields;
  
  const { toast } = useToast();

  // Generate bcrypt hash
  const generateHash = async () => {
    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter a password to hash.",
        variant: "destructive"
      });
      return;
    }

    updateField('isHashing', true);
    try {
      const salt = generateSalt(rounds);
      const hash = await bcryptLike(password, salt);
      updateField('hashResult', hash);
      
      toast({
        title: "Hash Generated",
        description: `Bcrypt-like hash generated with ${rounds} rounds.`,
      });
    } catch {
      toast({
        title: "Hash Failed",
        description: "Failed to generate hash. Please try again.",
        variant: "destructive"
      });
    } finally {
      updateField('isHashing', false);
    }
  };

  // Verify password against hash
  const verifyPasswordHash = async () => {
    if (!verifyPassword || !verifyHash) {
      toast({
        title: "Input Required",
        description: "Please enter both password and hash to verify.",
        variant: "destructive"
      });
      return;
    }

    updateField('isVerifying', true);
    try {
      const isValid = await verifyBcryptLike(verifyPassword, verifyHash);
      updateField('verifyResult', isValid);
      
      toast({
        title: isValid ? "Password Valid" : "Password Invalid",
        description: isValid ? "The password matches the hash." : "The password does not match the hash.",
        variant: isValid ? "default" : "destructive"
      });
    } catch {
      toast({
        title: "Verification Failed",
        description: "Failed to verify password. Please check the hash format.",
        variant: "destructive"
      });
    } finally {
      updateField('isVerifying', false);
    }
  };

  // Copy hash to clipboard
  const copyHash = async () => {
    if (!hashResult) return;
    
    try {
      await navigator.clipboard.writeText(hashResult);
      toast({
        title: "Hash Copied",
        description: "Bcrypt hash has been copied to clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy hash to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Copy verification hash to verify field
  const useGeneratedHash = () => {
    if (hashResult) {
      updateField('verifyHash', hashResult);
      updateField('verifyPassword', password);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, text: "No password" };
    if (pwd.length < 6) return { level: 1, text: "Very weak" };
    if (pwd.length < 8) return { level: 2, text: "Weak" };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    const levels = [
      { level: 1, text: "Very weak" },
      { level: 2, text: "Weak" },
      { level: 3, text: "Fair" },
      { level: 4, text: "Good" },
      { level: 5, text: "Strong" }
    ];
    
    return levels[Math.min(score, 4)];
  };

  const passwordStrength = getPasswordStrength(password);

  // Quick test passwords
  const testPasswords = [
    "password123",
    "MySecureP@ss!",
    "admin",
    "P@ssw0rd2024!",
    "weakpass"
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="BC-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          BCrypt Password Hashing
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Secure password hashing and verification using bcrypt-like algorithm with customizable cost factors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hash Generation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Generate Hash
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="password-input">Password</Label>
                <div className="relative">
                  <Input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password to hash..."
                    value={password}
                    onChange={(e) => updateField('password', e.target.value)}
                    data-testid="password-input"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => updateField('showPassword', !showPassword)}
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {password ? <div className="flex items-center gap-2 mt-1">
                    <div className={`w-full h-1 rounded ${
                      passwordStrength.level === 1 ? 'bg-red-500' :
                      passwordStrength.level === 2 ? 'bg-orange-500' :
                      passwordStrength.level === 3 ? 'bg-yellow-500' :
                      passwordStrength.level === 4 ? 'bg-blue-500' :
                      'bg-green-500'
                    }`} />
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {passwordStrength.text}
                    </span>
                  </div> : null}
              </div>

              <div>
                <Label htmlFor="cost-rounds">Cost Factor (Rounds)</Label>
                <Select value={rounds.toString()} onValueChange={(value) => updateField('rounds', parseInt(value))}>
                  <SelectTrigger data-testid="rounds-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 (Fast, Testing Only)</SelectItem>
                    <SelectItem value="6">6 (Very Fast)</SelectItem>
                    <SelectItem value="8">8 (Fast)</SelectItem>
                    <SelectItem value="10">10 (Recommended)</SelectItem>
                    <SelectItem value="12">12 (Secure)</SelectItem>
                    <SelectItem value="14">14 (Very Secure)</SelectItem>
                    <SelectItem value="16">16 (Extremely Secure)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Higher rounds = more secure but slower. Recommended: 10-12
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={generateHash} 
                  className="flex-1"
                  disabled={!password || isHashing}
                  data-testid="generate-hash"
                >
                {isHashing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Generate Hash
                </Button>
                <Button onClick={resetFields} variant="outline" data-testid="reset-bcrypt-button">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {hashResult ? <div className="space-y-2">
                  <Label>Generated Hash</Label>
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 font-mono text-xs break-all">
                    {hashResult}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyHash} variant="outline" size="sm" className="flex-1" data-testid="copy-hash">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={useGeneratedHash} variant="outline" size="sm" data-testid="use-for-verification">
                      Use for Verification
                    </Button>
                  </div>
                </div> : null}
            </CardContent>
          </Card>

          {/* Quick Test Passwords */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Test Passwords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testPasswords.map((pwd, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => updateField('password', pwd)}
                    className="w-full justify-start font-mono text-xs"
                    data-testid={`test-password-${index}`}
                  >
                    {pwd}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hash Verification */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Unlock className="w-5 h-5 mr-2" />
                Verify Hash
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="verify-password">Password to Verify</Label>
                <div className="relative">
                  <Input
                    id="verify-password"
                    type={showVerifyPassword ? "text" : "password"}
                    placeholder="Enter password..."
                    value={verifyPassword}
                    onChange={(e) => updateField('verifyPassword', e.target.value)}
                    data-testid="verify-password-input"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => updateField('showVerifyPassword', !showVerifyPassword)}
                    data-testid="toggle-verify-password-visibility"
                  >
                    {showVerifyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="verify-hash">Hash to Verify Against</Label>
                <textarea
                  id="verify-hash"
                  placeholder="Enter bcrypt hash..."
                  value={verifyHash}
                  onChange={(e) => updateField('verifyHash', e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs min-h-[80px] resize-none"
                  data-testid="verify-hash-input"
                />
              </div>

              <Button 
                onClick={verifyPasswordHash} 
                className="w-full"
                disabled={!verifyPassword || !verifyHash || isVerifying}
                data-testid="verify-hash"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Verify Password
              </Button>

              {verifyResult !== null && (
                <Alert variant={verifyResult ? "default" : "destructive"}>
                  <AlertDescription className="flex items-center">
                    {verifyResult ? (
                      <>
                        <Shield className="w-4 h-4 mr-2 text-green-600" />
                        ✅ Password is valid! The password matches the hash.
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2 text-red-600" />
                        ❌ Password is invalid. The password does not match the hash.
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {verifyHash ? <div className="text-xs text-slate-600 dark:text-slate-400">
                  <div>Hash length: {verifyHash.length} characters</div>
                  <div>Valid bcrypt format: {verifyHash.startsWith('$2') ? '✅ Yes' : '❌ No'}</div>
                </div> : null}
            </CardContent>
          </Card>

          {/* Hash Analysis */}
          {(hashResult || verifyHash) ? <Card>
              <CardHeader>
                <CardTitle>Hash Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {(hashResult || verifyHash).split('$').map((part, index) => {
                    if (index === 0) return null;
                    const labels = ['', 'Algorithm', 'Cost', 'Salt', 'Hash'];
                    return (
                      <div key={index} className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">{labels[index]}:</span>
                        <span className="font-mono">{part || 'N/A'}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Estimated Time:</span>
                    <span>~{Math.pow(2, rounds)} iterations</span>
                  </div>
                </div>
              </CardContent>
            </Card> : null}
        </div>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="BC-002" size="medium" />
      </div>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About BCrypt Password Hashing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">What is BCrypt?</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Adaptive cryptographic hash function for passwords</li>
                <li>• Built-in salt generation prevents rainbow table attacks</li>
                <li>• Configurable cost factor adjusts security over time</li>
                <li>• Industry standard for secure password storage</li>
                <li>• Resistant to brute-force and timing attacks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cost Factor Guidelines:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• <strong>4-6:</strong> Testing only (very fast)</li>
                <li>• <strong>8-10:</strong> Minimum for production</li>
                <li>• <strong>10-12:</strong> Recommended for most applications</li>
                <li>• <strong>12-14:</strong> High security applications</li>
                <li>• <strong>14+:</strong> Maximum security (very slow)</li>
              </ul>
            </div>
          </div>
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Security Note:</strong> This tool implements a bcrypt-like algorithm for demonstration purposes using Web Crypto API. 
              For production applications, use a proper bcrypt library with native implementations for better security and performance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="BC-003" size="large" />
      </div>
    </div>
  );
}