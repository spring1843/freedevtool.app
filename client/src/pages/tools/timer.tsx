import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  Square,
  Timer as TimerIcon,
  VolumeX,
  Share,
} from "lucide-react";
import {
  formatTimerTime,
  createTimerSound,
  playTimerBeep,
} from "@/lib/time-tools";
import { getParam, updateURL, copyShareableURL } from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";

export default function Timer() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5); // Interesting default: 5 minutes
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true); // Auto-start
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const beepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
          if (!isRunning && !isFinished) {
            startTimer();
          }
          break;
        case " ":
          event.preventDefault();
          if (isRunning) {
            pauseTimer();
          } else if (!isFinished) {
            startTimer();
          }
          break;
        case "Escape":
          event.preventDefault();
          stopTimer();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isFinished]);

  useEffect(() => {
    audioContextRef.current = createTimerSound();

    // Load parameters from URL
    const urlDays = getParam("d", 0);
    const urlHours = getParam("h", 0);
    const urlMinutes = getParam("m", 5);
    const urlSeconds = getParam("s", 0);

    setDays(urlDays);
    setHours(urlHours);
    setMinutes(urlMinutes);
    setSeconds(urlSeconds);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            startBeeping();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const startBeeping = () => {
    if (audioContextRef.current) {
      playTimerBeep(audioContextRef.current);
      beepIntervalRef.current = setInterval(() => {
        if (audioContextRef.current) {
          playTimerBeep(audioContextRef.current);
        }
      }, 1000);
    }
  };

  const stopBeeping = () => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
  };

  const startTimer = () => {
    if (isFinished) {
      stopBeeping();
      setIsFinished(false);
      reset();
      return;
    }

    if (!isRunning && timeLeft === 0) {
      // Starting fresh timer
      const totalSeconds =
        days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
      if (totalSeconds > 0) {
        setTimeLeft(totalSeconds);
        setIsRunning(true);
      }
    } else {
      // Resume
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    reset();
  };

  const startPause = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsFinished(false);
    stopBeeping();
  };

  const presetTimer = (d = 0, h = 0, mins: number, secs = 0) => {
    setDays(d);
    setHours(h);
    setMinutes(mins);
    setSeconds(secs);
    const totalSeconds = d * 24 * 60 * 60 + h * 60 * 60 + mins * 60 + secs;
    setTimeLeft(totalSeconds);
    setIsRunning(true);
    setIsFinished(false);
    updateURL({ d, h, m: mins, s: secs });
  };

  // Timer presets
  const timerPresets = [
    { label: "Pomodoro", mins: 25, desc: "25 minutes focus time" },
    { label: "Short Break", mins: 5, desc: "5 minute break" },
    { label: "Long Break", mins: 15, desc: "15 minute break" },
    { label: "Coffee", mins: 3, desc: "Coffee brewing time" },
    { label: "Tea", mins: 4, desc: "Tea steeping time" },
    { label: "Quick Timer", mins: 1, desc: "1 minute timer" },
  ];

  const handleInputChange = (field: string, value: number) => {
    if (!isRunning) {
      switch (field) {
        case "days":
          setDays(value);
          break;
        case "hours":
          setHours(value);
          break;
        case "minutes":
          setMinutes(value);
          break;
        case "seconds":
          setSeconds(value);
          break;
        default:
          console.warn(`Unknown timer field: ${field}`);
          break;
      }
      updateURL({
        d: field === "days" ? value : days,
        h: field === "hours" ? value : hours,
        m: field === "minutes" ? value : minutes,
        s: field === "seconds" ? value : seconds,
      });
    }
  };

  const shareTimer = async () => {
    const success = await copyShareableURL({
      d: days,
      h: hours,
      m: minutes,
      s: seconds,
    });
    if (success) {
      toast({
        title: "Timer shared!",
        description: "URL copied to clipboard with current timer settings",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const displayTime =
    timeLeft > 0
      ? timeLeft
      : days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="TM-001" size="large" className="mb-6" />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Timer
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Countdown timer with audio alert - supports days, hours, minutes, and
          seconds
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          Keyboard: Enter (start) • Space (pause/resume) • Esc (stop)
        </p>
      </div>

      {/* Timer Display */}
      <Card
        className={`mb-6 transition-colors ${isFinished ? "border-red-500 bg-red-50 dark:bg-red-900/20" : ""}`}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <div
              className={`text-6xl font-mono font-bold mb-8 ${
                isFinished
                  ? "text-red-600 dark:text-red-400 animate-pulse"
                  : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {formatTimerTime(displayTime)}
            </div>

            {isFinished ? (
              <div className="mb-4">
                <div className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  Timer Finished!
                </div>
                <Button
                  onClick={() => {
                    stopBeeping();
                    setIsFinished(false);
                    reset();
                  }}
                  variant="destructive"
                  size="lg"
                  data-testid="stop-alarm-button"
                >
                  <VolumeX className="w-5 h-5 mr-2" />
                  Stop Alarm
                </Button>
              </div>
            ) : null}

            {!isFinished && (
              <div className="flex justify-center gap-4">
                <Button
                  onClick={startPause}
                  size="lg"
                  variant={isRunning ? "secondary" : "default"}
                  disabled={
                    !isRunning &&
                    timeLeft === 0 &&
                    days === 0 &&
                    hours === 0 &&
                    minutes === 0 &&
                    seconds === 0
                  }
                  data-testid={
                    isRunning ? "pause-timer-button" : "start-timer-button"
                  }
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause (Space)
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start (Enter)
                    </>
                  )}
                </Button>

                <Button
                  onClick={reset}
                  variant="outline"
                  size="lg"
                  data-testid="reset-timer-button"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Reset (Esc)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timer Setup */}
      {!isRunning && timeLeft === 0 && !isFinished && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TimerIcon className="w-5 h-5 mr-2" />
                Set Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="days">Days</Label>
                  <Input
                    id="days"
                    type="number"
                    min="0"
                    max="99"
                    value={days}
                    onChange={e =>
                      handleInputChange(
                        "days",
                        Math.max(0, parseInt(e.target.value, 10) || 0)
                      )
                    }
                    data-testid="days-input"
                  />
                </div>
                <div>
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={e =>
                      handleInputChange(
                        "hours",
                        Math.max(0, parseInt(e.target.value, 10) || 0)
                      )
                    }
                    data-testid="hours-input"
                  />
                </div>
                <div>
                  <Label htmlFor="minutes">Minutes</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={e =>
                      handleInputChange(
                        "minutes",
                        Math.max(0, parseInt(e.target.value, 10) || 0)
                      )
                    }
                    data-testid="minutes-input"
                  />
                </div>
                <div>
                  <Label htmlFor="seconds">Seconds</Label>
                  <Input
                    id="seconds"
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={e =>
                      handleInputChange(
                        "seconds",
                        Math.max(
                          0,
                          Math.min(59, parseInt(e.target.value, 10) || 0)
                        )
                      )
                    }
                    data-testid="seconds-input"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={shareTimer}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                  data-testid="share-timer-button"
                >
                  <Share className="w-4 h-4" />
                  <span>Share Timer Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {timerPresets.map((preset, index) => (
                  <Button
                    key={index}
                    onClick={() => presetTimer(0, 0, preset.mins)}
                    variant="outline"
                    className="text-left flex flex-col items-start p-3 h-auto"
                    data-testid={`preset-${preset.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-xs text-slate-500">
                      {preset.desc}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="TM-002" size="medium" />
      </div>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Supports days, hours, minutes, and seconds</li>
                <li>• Audio beep alerts when timer finishes</li>
                <li>• Start, pause, resume, and reset controls</li>
                <li>• Quick preset buttons for common durations</li>
                <li>• Dynamic display format (DD:HH:MM:SS)</li>
                <li>• Visual alarm with color changes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage Tips:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Set custom time using input fields</li>
                <li>• Use preset buttons for quick timing</li>
                <li>• Timer can be paused and resumed</li>
                <li>• Audio alarm continues until stopped</li>
                <li>• Visual cues show timer status</li>
                <li>• Perfect for work, study, or cooking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="TM-003" size="large" />
      </div>
    </div>
  );
}
