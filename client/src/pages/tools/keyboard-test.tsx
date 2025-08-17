import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Keyboard, RotateCcw, Info } from "lucide-react";
import AdSlot from "@/components/ui/ad-slot";

interface KeyPress {
  key: string;
  code: string;
  timestamp: number;
  id: string;
}

export default function KeyboardTest() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [keyHistory, setKeyHistory] = useState<KeyPress[]>([]);
  const [isActive, setIsActive] = useState(true);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive) return;

      event.preventDefault();

      const keyPress: KeyPress = {
        key: event.key,
        code: event.code,
        timestamp: Date.now(),
        id: `${event.code}-${Date.now()}`,
      };

      setPressedKeys(prev => new Set(prev).add(event.code));
      setKeyHistory(prev => [keyPress, ...prev.slice(0, 49)]); // Keep last 50 key presses
    },
    [isActive]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive) return;

      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.code);
        return newSet;
      });
    },
    [isActive]
  );

  useEffect(() => {
    if (isActive) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, isActive]);

  const clearHistory = () => {
    setKeyHistory([]);
    setPressedKeys(new Set());
  };

  const toggleTesting = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setPressedKeys(new Set());
    }
  };

  // Get key display name
  const getKeyDisplayName = (key: string) => {
    const specialKeys: { [key: string]: string } = {
      " ": "Space",
      ArrowUp: "↑",
      ArrowDown: "↓",
      ArrowLeft: "←",
      ArrowRight: "→",
      Enter: "Enter",
      Tab: "Tab",
      Shift: "Shift",
      Control: "Ctrl",
      Alt: "Alt",
      Meta: "Win",
      CapsLock: "Caps Lock",
      Backspace: "⌫",
      Delete: "Del",
      Escape: "Esc",
    };

    return specialKeys[key] || (key.length === 1 ? key.toUpperCase() : key);
  };

  // Get key category for styling
  const getKeyCategory = (code: string) => {
    if (code.startsWith("Key")) return "letter";
    if (code.startsWith("Digit")) return "number";
    if (code.startsWith("Arrow")) return "arrow";
    if (
      [
        "ShiftLeft",
        "ShiftRight",
        "ControlLeft",
        "ControlRight",
        "AltLeft",
        "AltRight",
        "MetaLeft",
        "MetaRight",
      ].includes(code)
    )
      return "modifier";
    if (
      ["Space", "Enter", "Tab", "Backspace", "Delete", "Escape"].includes(code)
    )
      return "special";
    if (code.startsWith("F") && /F\d+/.test(code)) return "function";
    return "other";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      letter: "bg-blue-500 text-white",
      number: "bg-green-500 text-white",
      arrow: "bg-purple-500 text-white",
      modifier: "bg-orange-500 text-white",
      special: "bg-red-500 text-white",
      function: "bg-indigo-500 text-white",
      other: "bg-slate-500 text-white",
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="KT-001" size="large" className="mb-6" />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Keyboard Test
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Test your keyboard keys and see which buttons you're pressing in
          real-time
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Keyboard className="w-5 h-5 mr-2" />
              Keyboard Testing
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                data-testid="clear-history"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear History
              </Button>
              <Button
                variant={isActive ? "destructive" : "default"}
                size="sm"
                onClick={toggleTesting}
                data-testid="toggle-testing"
              >
                {isActive ? "Stop Testing" : "Start Testing"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="w-4 h-4" />
            <AlertDescription>
              {isActive ? (
                <>
                  Press any key to test it. Keys will light up when pressed and
                  appear in the history below.
                </>
              ) : (
                <>
                  Click "Start Testing" to begin keyboard testing. Make sure
                  this page has focus.
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Currently Pressed Keys */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Currently Pressed ({pressedKeys.size})
            </h3>
            <div className="min-h-[60px] p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
              {pressedKeys.size === 0 ? (
                <div className="text-slate-500 dark:text-slate-400 italic">
                  No keys currently pressed
                </div>
              ) : (
                Array.from(pressedKeys).map(code => {
                  const keyPress = keyHistory.find(k => k.code === code);
                  const category = getKeyCategory(code);
                  const displayName = keyPress
                    ? getKeyDisplayName(keyPress.key)
                    : code;

                  return (
                    <Badge
                      key={code}
                      className={`${getCategoryColor(category)} text-sm px-3 py-1`}
                      data-testid={`pressed-key-${code}`}
                    >
                      {displayName}
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key History */}
      <Card>
        <CardHeader>
          <CardTitle>Key Press History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
              <span>Recent key presses (last 50)</span>
              <span>{keyHistory.length} total presses</span>
            </div>

            <div className="max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700">
              {keyHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Keyboard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No keys pressed yet</p>
                  <p className="text-sm">
                    Start typing to see key presses here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {keyHistory.map((keyPress, index) => {
                    const category = getKeyCategory(keyPress.code);
                    const displayName = getKeyDisplayName(                      keyPress.key                    );
                    const timeAgo = (
                      (Date.now() - keyPress.timestamp) /
                      1000
                    ).toFixed(1);

                    return (
                      <div
                        key={keyPress.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        data-testid={`history-item-${index}`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`${getCategoryColor(category)} text-xs`}
                          >
                            {displayName}
                          </Badge>
                          <div className="text-sm">
                            <span className="font-mono text-slate-600 dark:text-slate-400">
                              {keyPress.code}
                            </span>
                            {keyPress.key !== displayName && (
                              <span className="text-slate-500 dark:text-slate-500 ml-2">
                                ({keyPress.key})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {timeAgo}s ago
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="KT-002" size="medium" />
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
            {[
              "letter",
              "number",
              "arrow",
              "modifier",
              "special",
              "function",
              "other",
            ].map(category => {
              const count = keyHistory.filter(
                k => getKeyCategory(k.code) === category
              ).length;
              const percentage =
                keyHistory.length > 0
                  ? ((count / keyHistory.length) * 100).toFixed(1)
                  : "0";

              return (
                <div
                  key={category}
                  className="p-3 border border-slate-200 dark:border-slate-700"
                >
                  <div
                    className={`inline-block px-2 py-1 text-xs font-semibold mb-2 ${getCategoryColor(category)}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {count}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Testing Your Keyboard:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Make sure this browser tab has focus</li>
                <li>• Press any key to see it light up</li>
                <li>• Hold multiple keys to test combinations</li>
                <li>• Check if all keys register properly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Categories:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>
                  • <span className="inline-block w-3 h-3 bg-blue-500 mr-2" />
                  Letters (A-Z)
                </li>
                <li>
                  • <span className="inline-block w-3 h-3 bg-green-500 mr-2" />
                  Numbers (0-9)
                </li>
                <li>
                  • <span className="inline-block w-3 h-3 bg-purple-500 mr-2" />
                  Arrow keys
                </li>
                <li>
                  • <span className="inline-block w-3 h-3 bg-orange-500 mr-2" />
                  Modifiers (Ctrl, Alt, etc.)
                </li>
              </ul>
            </div>
          </div>
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Note:</strong> This tool works entirely in your browser
              and doesn't send any data to servers. Some special keys may not be
              captured due to browser security restrictions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="KT-003" size="large" />
      </div>
    </div>
  );
}
