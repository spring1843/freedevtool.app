import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Copy,
  Check,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AdSlot from "@/components/ui/ad-slot";
import { useToolDefault } from "@/hooks/use-tool-default";
import { usePersistentForm } from "@/hooks/use-persistent-state";

interface PasswordStrength {
  score: number;
  description: string;
  color: string;
  bgColor: string;
}

export default function PasswordGenerator() {
  const { fields, updateField, resetFields } = usePersistentForm(
    "password-generator",
    {
      passwords: [] as string[],
      passwordCount: 1,
      length: [16] as number[],
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      showStrength: true,
    }
  );

  const {
    passwords,
    passwordCount,
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeSimilar,
    excludeAmbiguous,
    showStrength,
  } = fields;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(
    new Set()
  );

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let charset = "";

    if (includeUppercase) {
      charset += excludeSimilar ? uppercase.replace(/[ILO]/g, "") : uppercase;
    }
    if (includeLowercase) {
      charset += excludeSimilar ? lowercase.replace(/[ilo]/g, "") : lowercase;
    }
    if (includeNumbers) {
      charset += excludeSimilar ? numbers.replace(/[10]/g, "") : numbers;
    }
    if (includeSymbols) {
      let symbolSet = symbols;
      if (excludeAmbiguous) {
        symbolSet = symbols.replace(/[{}[\]()\/\\'"`,;.<>]/g, "");
      }
      charset += symbolSet;
    }

    if (!charset) {
      return "";
    }

    let password = "";
    const passwordLength = length[0];

    // Ensure at least one character from each selected category
    const requiredChars: string[] = [];
    if (includeUppercase)
      requiredChars.push(
        uppercase[Math.floor(Math.random() * uppercase.length)]
      );
    if (includeLowercase)
      requiredChars.push(
        lowercase[Math.floor(Math.random() * lowercase.length)]
      );
    if (includeNumbers)
      requiredChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
    if (includeSymbols)
      requiredChars.push(symbols[Math.floor(Math.random() * symbols.length)]);

    // Add required characters first
    for (const char of requiredChars) {
      password += char;
    }

    // Fill remaining length with random characters from charset
    for (let i = password.length; i < passwordLength; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password to avoid predictable patterns
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const generatePasswords = () => {
    const newPasswords = [];
    for (let i = 0; i < passwordCount; i++) {
      newPasswords.push(generatePassword());
    }
    updateField("passwords", newPasswords);
    setVisiblePasswords(new Set()); // Hide all passwords by default
  };

  const handleReset = () => {
    resetFields();
    setVisiblePasswords(new Set());
  };

  // Generate passwords with default settings on component mount
  useToolDefault(() => {
    generatePasswords();
  });

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  const copyAllPasswords = async () => {
    try {
      const allPasswords = passwords.join("\n");
      await navigator.clipboard.writeText(allPasswords);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      console.error("Failed to copy all passwords");
    }
  };

  const assessPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const { length } = password;

    // Length scoring
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 1; // Common patterns

    score = Math.max(0, Math.min(5, score));

    const strengthLevels = [
      {
        score: 0,
        description: "Very Weak",
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      {
        score: 1,
        description: "Weak",
        color: "text-red-500",
        bgColor: "bg-red-50",
      },
      {
        score: 2,
        description: "Fair",
        color: "text-orange-500",
        bgColor: "bg-orange-50",
      },
      {
        score: 3,
        description: "Good",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
      },
      {
        score: 4,
        description: "Strong",
        color: "text-green-500",
        bgColor: "bg-green-50",
      },
      {
        score: 5,
        description: "Very Strong",
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
    ];

    return strengthLevels[score];
  };

  const togglePasswordVisibility = (index: number) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(index)) {
      newVisible.delete(index);
    } else {
      newVisible.add(index);
    }
    setVisiblePasswords(newVisible);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="PWD-001" size="large" className="mb-6" />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Password Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Generate secure passwords with customizable options and strength
          analysis
        </p>
      </div>

      {/* Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Password Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Number of Passwords */}
          <div className="space-y-2">
            <Label htmlFor="password-count">Number of Passwords (1-100)</Label>
            <Input
              id="password-count"
              type="number"
              min="1"
              max="100"
              value={passwordCount}
              onChange={e =>
                updateField(
                  "passwordCount",
                  Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                )
              }
              data-testid="password-count-input"
            />
          </div>

          {/* Password Length */}
          <div className="space-y-3">
            <Label>Password Length: {length[0]} characters</Label>
            <Slider
              value={length}
              onValueChange={value => updateField("length", value)}
              max={128}
              min={4}
              step={1}
              className="w-full"
              data-testid="password-length-slider"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>4</span>
              <span>128</span>
            </div>
          </div>

          {/* Character Type Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uppercase"
                  checked={includeUppercase}
                  onCheckedChange={checked =>
                    updateField("includeUppercase", checked as boolean)
                  }
                  data-testid="uppercase-checkbox"
                />
                <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowercase"
                  checked={includeLowercase}
                  onCheckedChange={checked =>
                    updateField("includeLowercase", checked as boolean)
                  }
                  data-testid="lowercase-checkbox"
                />
                <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={includeNumbers}
                  onCheckedChange={checked =>
                    updateField("includeNumbers", checked as boolean)
                  }
                  data-testid="numbers-checkbox"
                />
                <Label htmlFor="numbers">Numbers (0-9)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="symbols"
                  checked={includeSymbols}
                  onCheckedChange={checked =>
                    updateField("includeSymbols", checked as boolean)
                  }
                  data-testid="symbols-checkbox"
                />
                <Label htmlFor="symbols">Symbols (!@#$%^&*)</Label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exclude-similar"
                  checked={excludeSimilar}
                  onCheckedChange={checked =>
                    updateField("excludeSimilar", checked as boolean)
                  }
                  data-testid="exclude-similar-checkbox"
                />
                <Label htmlFor="exclude-similar">
                  Exclude Similar Characters (i, l, 1, L, o, 0, O)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exclude-ambiguous"
                  checked={excludeAmbiguous}
                  onCheckedChange={checked =>
                    updateField("excludeAmbiguous", checked as boolean)
                  }
                  data-testid="exclude-ambiguous-checkbox"
                />
                <Label htmlFor="exclude-ambiguous">
                  Exclude Ambiguous Characters ({}, [ ], ( ), etc.)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-strength"
                  checked={showStrength}
                  onCheckedChange={checked =>
                    updateField("showStrength", checked as boolean)
                  }
                  data-testid="show-strength-switch"
                />
                <Label htmlFor="show-strength">Show Password Strength</Label>
              </div>
            </div>
          </div>

          {/* Generate and Reset Buttons */}
          <div className="pt-4 flex gap-3">
            <Button
              onClick={generatePasswords}
              disabled={
                !includeUppercase &&
                !includeLowercase &&
                !includeNumbers &&
                !includeSymbols
              }
              className="flex-1"
              data-testid="generate-button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate{" "}
              {passwordCount === 1 ? "Password" : `${passwordCount} Passwords`}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              data-testid="reset-button"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="PWD-002" size="medium" />
      </div>

      {/* Generated Passwords */}
      {passwords.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Passwords</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-normal text-slate-500">
                  {passwords.length} password{passwords.length !== 1 ? "s" : ""}
                </span>
                {passwords.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyAllPasswords}
                    className="flex items-center space-x-1"
                    data-testid="copy-all-passwords"
                  >
                    {copiedAll ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="text-xs">Copy All</span>
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {passwords.map((password, index) => {
                const strength = showStrength
                  ? assessPasswordStrength(password)
                  : null;
                const isVisible = visiblePasswords.has(index);

                return (
                  <div
                    key={index}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2"
                    data-testid={`password-item-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Password #{index + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        {strength ? (
                          <span
                            className={`text-xs px-2 py-1 rounded ${strength.bgColor} ${strength.color}`}
                          >
                            {strength.description}
                          </span>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePasswordVisibility(index)}
                          data-testid={`toggle-visibility-${index}`}
                        >
                          {isVisible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(password, index)}
                          data-testid={`copy-password-${index}`}
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="font-mono text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded border">
                      {isVisible ? password : "•".repeat(password.length)}
                    </div>

                    {strength ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map(level => (
                            <div
                              key={level}
                              className={`w-4 h-2 rounded-sm ${
                                level <= strength.score
                                  ? strength.score <= 2
                                    ? "bg-red-400"
                                    : strength.score <= 3
                                      ? "bg-yellow-400"
                                      : "bg-green-400"
                                  : "bg-slate-200 dark:bg-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">
                          {password.length} characters
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Ad */}
      <AdSlot position="bottom" id="PWD-003" size="large" />
    </div>
  );
}
