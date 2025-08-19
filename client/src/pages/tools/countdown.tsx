import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, RotateCcw, Clock } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";

export default function Countdown() {
  // Set interesting default values (New Year countdown)
  const getDefaultDateTime = () => {
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0); // Next New Year
    return {
      date: nextYear.toISOString().split("T")[0],
      time: "00:00",
    };
  };

  const defaultDateTime = getDefaultDateTime();
  const [targetDate, setTargetDate] = useState(defaultDateTime.date);
  const [targetTime, setTargetTime] = useState(defaultDateTime.time);
  const [isActive, setIsActive] = useState(true); // Auto-start
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const calculateTimeRemaining = useCallback(() => {
    if (!targetDate || !targetTime) return 0;

    const targetDateTime = new Date(`${targetDate}T${targetTime}`);
    const now = new Date();

    return Math.max(0, targetDateTime.getTime() - now.getTime());
  }, [targetDate, targetTime]);

  const startCountdown = useCallback(() => {
    if (!targetDate || !targetTime) return;

    setIsActive(true);
    setIsComplete(false);

    intervalRef.current = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setIsActive(false);
        setIsComplete(true);

        // Play sound if enabled
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(console.error);
        }

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 1000);
  }, [targetDate, targetTime, soundEnabled, calculateTimeRemaining]);

  const pauseCountdown = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopCountdown = useCallback(() => {
    setIsActive(false);
    setIsComplete(false);
    setTimeRemaining(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "Enter":
          event.preventDefault();
          if (!isActive && !isComplete) {
            startCountdown();
          }
          break;
        case " ":
          event.preventDefault();
          if (isActive) {
            pauseCountdown();
          } else if (!isComplete) {
            startCountdown();
          }
          break;
        case "Escape":
          event.preventDefault();
          stopCountdown();
          break;
        default: {
          // Handle default case
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isComplete, startCountdown, pauseCountdown, stopCountdown]);

  // Auto-start on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (targetDate && targetTime) {
        startCountdown();
      }
    }, 500); // Small delay to ensure UI is ready

    return () => clearTimeout(timer);
  }, [targetDate, targetTime, startCountdown]);

  const formatTime = (milliseconds: number) => {
    if (milliseconds <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  };

  const calculateTimeRemaining = useCallback(() => {
    if (!targetDate || !targetTime) return 0;

    const targetDateTime = new Date(`${targetDate}T${targetTime}`);
    const now = new Date();

    return Math.max(0, targetDateTime.getTime() - now.getTime());
  }, [targetDate, targetTime]);

  const startCountdown = useCallback(() => {
    if (!targetDate || !targetTime) return;

    setIsActive(true);
    setIsComplete(false);

    intervalRef.current = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setIsActive(false);
        setIsComplete(true);

        // Play sound if enabled
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(console.error);
        }

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 1000);
  }, [targetDate, targetTime, soundEnabled, calculateTimeRemaining]);

  const pauseCountdown = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopCountdown = useCallback(() => {
    setIsActive(false);
    setIsComplete(false);
    setTimeRemaining(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleReset = () => {
    stopCountdown();
    setTargetDate("");
    setTargetTime("");
    setSoundEnabled(true);
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  };

  // Preset options for interesting countdowns
  const presets = [
    {
      label: "New Year",
      date: new Date(new Date().getFullYear() + 1, 0, 1),
      time: "00:00",
    },
    {
      label: "Christmas",
      date: new Date(new Date().getFullYear(), 11, 25),
      time: "00:00",
    },
    {
      label: "Weekend",
      date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + (6 - d.getDay()));
        return d;
      })(),
      time: "17:00",
    },
    { label: "1 Hour", date: new Date(Date.now() + 60 * 60 * 1000), time: "" },
    {
      label: "24 Hours",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      time: "",
    },
    {
      label: "1 Week",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: "",
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    const { date } = preset;
    const dateStr = date.toISOString().split("T")[0];
    const timeStr = preset.time || date.toTimeString().slice(0, 5);

    setTargetDate(dateStr);
    setTargetTime(timeStr);
    setIsActive(false);
    setIsComplete(false);

    // Auto-start after setting
    setTimeout(() => {
      setIsActive(true);
    }, 100);
  };

  useEffect(() => {
    // Create audio element for countdown completion
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsbBjiUbufgxGUsASqLv+OBMi0RXKXb2Gc8PiMK"
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
    }
  }, [targetDate, targetTime, isActive, calculateTimeRemaining]);

  const timeComponents = formatTime(timeRemaining);
  const isExpired = timeRemaining <= 0 && targetDate && targetTime;

  const getCountdownStatus = () => {
    if (isComplete) return { color: "text-red-600", text: "Expired!" };
    if (isActive) return { color: "text-green-600", text: "Running" };
    if (isExpired) return { color: "text-red-600", text: "Expired" };
    return { color: "text-gray-600", text: "Stopped" };
  };

  const status = getCountdownStatus();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Countdown Timer
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Countdown to a specific date and time
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Keyboard: Enter (start) • Space (pause/resume) • Esc (stop)
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Target Date & Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="target-date">Target Date</Label>
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                data-testid="target-date"
              />
            </div>
            <div>
              <Label htmlFor="target-time">Target Time</Label>
              <Input
                id="target-time"
                type="time"
                step="1"
                value={targetTime}
                onChange={e => setTargetTime(e.target.value)}
                data-testid="target-time"
              />
            </div>
            <div>
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={timeZone} onValueChange={setTimeZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    Pacific Time
                  </SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Quick Presets</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {presets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
              <Label htmlFor="sound-enabled">
                Play sound when countdown reaches zero
              </Label>
            </div>
          </div>

          <div className="flex gap-3">
            {!isActive ? (
              <Button
                onClick={startCountdown}
                disabled={!targetDate || !targetTime}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                data-testid="button-start"
              >
                <Play className="w-4 h-4 mr-2" />
                Start (Enter)
              </Button>
            ) : (
              <Button
                onClick={pauseCountdown}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                data-testid="button-pause"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause (Space)
              </Button>
            )}

            <Button
              onClick={stopCountdown}
              variant="outline"
              data-testid="button-stop"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop (Esc)
            </Button>

            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Time Remaining
            </div>
            <Badge variant="outline" className={status.color}>
              {status.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isComplete ? (
            <div className="text-center mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                🎉 Countdown Complete! 🎉
              </div>
              <div className="text-red-700 dark:text-red-300">
                Target time has been reached
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {timeComponents.days}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Days
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {timeComponents.hours}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Hours
              </div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {timeComponents.minutes}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                Minutes
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {timeComponents.seconds}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Seconds
              </div>
            </div>
          </div>

          {targetDate && targetTime ? (
            <div className="mt-6 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Target:
              </div>
              <div className="font-mono text-lg">
                {new Date(`${targetDate}T${targetTime}`).toLocaleString(
                  undefined,
                  {
                    timeZone,
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">({timeZone})</div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
