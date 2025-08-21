import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Square,
  Plus,
  X,
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

interface TimerInstance {
  id: string;
  name: string;
  duration: number; // in seconds
  timeLeft: number;
  isRunning: boolean;
  isFinished: boolean;
  alarmCount: number; // 1, 2, 3, or -1 for manual stop
  currentAlarmPlays: number;
}

export default function Timer() {
  // Default timer setup - 5 minutes as per STYLE.md requirement
  const [newTimerHours, setNewTimerHours] = useState(0);
  const [newTimerMinutes, setNewTimerMinutes] = useState(5);
  const [newTimerSeconds, setNewTimerSeconds] = useState(0);
  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerAlarmCount, setNewTimerAlarmCount] = useState(3);
  const [timers, setTimers] = useState<TimerInstance[]>([]);
  const [showAddTimer, setShowAddTimer] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const { toast } = useToast();

  // Define functions first before using them in effects
  const startAlarm = useCallback(
    (timer: TimerInstance) => {
      if (timer.alarmCount === -1) {
        // Manual stop mode - keep playing until user stops
        const playAlarm = () => {
          if (audioContextRef.current) {
            playTimerBeep(audioContextRef.current);
          }
        };

        playAlarm(); // Play immediately
        const alarmInterval = setInterval(playAlarm, 2000); // Every 2 seconds
        alarmIntervalsRef.current.set(timer.id, alarmInterval);

        toast({
          title: "Timer Finished!",
          description: `${timer.name} - Click stop to silence alarm`,
        });
      } else {
        // Limited plays mode
        let playsLeft = timer.alarmCount;
        const playAlarm = () => {
          if (audioContextRef.current && playsLeft > 0) {
            playTimerBeep(audioContextRef.current);
            playsLeft--;

            if (playsLeft <= 0) {
              const interval = alarmIntervalsRef.current.get(timer.id);
              if (interval) {
                clearInterval(interval);
                alarmIntervalsRef.current.delete(timer.id);
              }
            }
          }
        };

        playAlarm(); // Play immediately
        if (playsLeft > 0) {
          const alarmInterval = setInterval(playAlarm, 2000);
          alarmIntervalsRef.current.set(timer.id, alarmInterval);
        }

        toast({
          title: "Timer Finished!",
          description: `${timer.name} - Playing alarm ${timer.alarmCount} times`,
        });
      }
    },
    [toast]
  );

  const addTimer = useCallback(() => {
    if (newTimerHours === 0 && newTimerMinutes === 0 && newTimerSeconds === 0) {
      toast({
        title: "Invalid Timer",
        description: "Please set a duration greater than 0",
        variant: "destructive",
      });
      return;
    }

    const duration =
      newTimerHours * 3600 + newTimerMinutes * 60 + newTimerSeconds;
    const timeDisplay =
      newTimerHours > 0
        ? `${newTimerHours}:${newTimerMinutes.toString().padStart(2, "0")}:${newTimerSeconds.toString().padStart(2, "0")}`
        : `${newTimerMinutes}:${newTimerSeconds.toString().padStart(2, "0")}`;
    const name = newTimerName.trim() || `Timer ${timeDisplay}`;

    const newTimer: TimerInstance = {
      id: `timer-${Date.now()}`,
      name,
      duration,
      timeLeft: duration,
      isRunning: false,
      isFinished: false,
      alarmCount: newTimerAlarmCount,
      currentAlarmPlays: 0,
    };

    setTimers(prev => [...prev, newTimer]);

    // Reset form
    setNewTimerName("");
    setNewTimerHours(0);
    setNewTimerMinutes(5);
    setNewTimerSeconds(0);
    setNewTimerAlarmCount(3);
    setShowAddTimer(false);

    // Update URL with latest timer
    updateURL({
      h: newTimerHours,
      m: newTimerMinutes,
      s: newTimerSeconds,
      name,
    });

    toast({
      title: "Timer Added",
      description: `Added ${name}`,
    });
  }, [
    newTimerHours,
    newTimerMinutes,
    newTimerSeconds,
    newTimerName,
    newTimerAlarmCount,
    toast,
  ]);

  const toggleTimer = useCallback((id: string) => {
    setTimers(prev =>
      prev.map(timer =>
        timer.id === id
          ? { ...timer, isRunning: !timer.isRunning, isFinished: false }
          : timer
      )
    );
  }, []);

  const stopAllTimers = useCallback(() => {
    // Clear all alarms
    alarmIntervalsRef.current.forEach(interval => clearInterval(interval));
    alarmIntervalsRef.current.clear();

    setTimers(prev =>
      prev.map(timer => ({
        ...timer,
        isRunning: false,
        isFinished: false,
        timeLeft: timer.duration,
        currentAlarmPlays: 0,
      }))
    );
  }, []);

  // Initialize audio context and default timer
  useEffect(() => {
    audioContextRef.current = createTimerSound();

    // Capture ref value at effect start
    const intervals = alarmIntervalsRef.current;

    // Load from URL parameters or create default timer
    const urlHours = getParam("h", 0);
    const urlMinutes = getParam("m", 5);
    const urlSeconds = getParam("s", 0);
    const urlName = getParam("name", "");

    if (urlHours > 0 || urlMinutes > 0 || urlSeconds > 0) {
      const duration = urlHours * 3600 + urlMinutes * 60 + urlSeconds;
      const defaultTimer: TimerInstance = {
        id: `timer-${Date.now()}`,
        name:
          urlName ||
          `Timer ${urlHours > 0 ? `${urlHours}:` : ""}${urlMinutes}:${urlSeconds.toString().padStart(2, "0")}`,
        duration,
        timeLeft: duration,
        isRunning: false, // Don't auto-start per STYLE.md for tools that make sound
        isFinished: false,
        alarmCount: 3,
        currentAlarmPlays: 0,
      };
      setTimers([defaultTimer]);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      // Clear all alarm intervals using captured ref value
      intervals.forEach(interval => clearInterval(interval));
      intervals.clear();
    };
  }, []);

  // Main timer update loop
  useEffect(() => {
    if (timers.some(timer => timer.isRunning)) {
      intervalRef.current = setInterval(() => {
        setTimers(prevTimers =>
          prevTimers.map(timer => {
            if (!timer.isRunning || timer.timeLeft <= 0) return timer;

            const newTimeLeft = timer.timeLeft - 1;
            if (newTimeLeft <= 0) {
              // Timer finished
              startAlarm(timer);
              return {
                ...timer,
                timeLeft: 0,
                isRunning: false,
                isFinished: true,
              };
            }

            return { ...timer, timeLeft: newTimeLeft };
          })
        );
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
  }, [timers, startAlarm]);

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
          if (!showAddTimer) {
            addTimer();
          }
          break;
        case " ":
          event.preventDefault();
          // Toggle the first timer if any exists
          if (timers.length > 0) {
            toggleTimer(timers[0].id);
          }
          break;
        case "Escape":
          event.preventDefault();
          stopAllTimers();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [timers, showAddTimer, addTimer, toggleTimer, stopAllTimers]);

  // Additional timer functions
  const stopTimer = useCallback((id: string) => {
    // Stop alarm if playing
    const alarmInterval = alarmIntervalsRef.current.get(id);
    if (alarmInterval) {
      clearInterval(alarmInterval);
      alarmIntervalsRef.current.delete(id);
    }

    setTimers(prev =>
      prev.map(timer =>
        timer.id === id
          ? {
              ...timer,
              isRunning: false,
              isFinished: false,
              timeLeft: timer.duration,
              currentAlarmPlays: 0,
            }
          : timer
      )
    );
  }, []);

  const removeTimer = useCallback((id: string) => {
    // Stop alarm if playing
    const alarmInterval = alarmIntervalsRef.current.get(id);
    if (alarmInterval) {
      clearInterval(alarmInterval);
      alarmIntervalsRef.current.delete(id);
    }

    setTimers(prev => prev.filter(timer => timer.id !== id));
  }, []);

  const copyShareURL = useCallback(() => {
    if (timers.length > 0) {
      const timer = timers[0];
      const hours = Math.floor(timer.duration / 3600);
      const minutes = Math.floor((timer.duration % 3600) / 60);
      const seconds = timer.duration % 60;
      copyShareableURL({ h: hours, m: minutes, s: seconds, name: timer.name });
    } else {
      copyShareableURL({
        h: newTimerHours,
        m: newTimerMinutes,
        s: newTimerSeconds,
      });
    }
  }, [timers, newTimerHours, newTimerMinutes, newTimerSeconds]);

  const getAlarmText = (count: number) => {
    switch (count) {
      case 1:
        return "1 time";
      case 2:
        return "2 times";
      case 3:
        return "3 times";
      case -1:
        return "Until stopped";
      default:
        return `${count} times`;
    }
  };

  // Timer presets for common use cases
  const timerPresets = [
    { name: "Coffee Break", hours: 0, minutes: 5, seconds: 0 },
    { name: "Meditation", hours: 0, minutes: 10, seconds: 0 },
    { name: "Study Block", hours: 0, minutes: 25, seconds: 0 },
    { name: "Short Break", hours: 0, minutes: 15, seconds: 0 },
    { name: "Workout", hours: 0, minutes: 30, seconds: 0 },
    { name: "Lunch Break", hours: 1, minutes: 0, seconds: 0 },
    { name: "Long Focus", hours: 1, minutes: 30, seconds: 0 },
    { name: "Power Nap", hours: 0, minutes: 20, seconds: 0 },
  ];

  const applyPreset = (preset: (typeof timerPresets)[0]) => {
    setNewTimerHours(preset.hours);
    setNewTimerMinutes(preset.minutes);
    setNewTimerSeconds(preset.seconds);
    setNewTimerName(preset.name);
    setShowAddTimer(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Timer
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Create multiple timers with customizable alarms. Use Enter, Space,
            and Escape for quick control.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddTimer(!showAddTimer)}
            data-testid="add-timer-toggle"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Timer
          </Button>
          {timers.length > 0 && (
            <Button
              onClick={stopAllTimers}
              variant="outline"
              data-testid="stop-all-timers"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop All
            </Button>
          )}
          <Button
            onClick={copyShareURL}
            variant="outline"
            size="icon"
            data-testid="share-timer"
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add Timer Form */}
      {showAddTimer ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="timer-name">Timer Name (Optional)</Label>
                <Input
                  id="timer-name"
                  placeholder="e.g., Coffee break"
                  value={newTimerName}
                  onChange={e => setNewTimerName(e.target.value)}
                  data-testid="timer-name-input"
                />
              </div>

              <div>
                <Label htmlFor="timer-hours">Hours</Label>
                <Input
                  id="timer-hours"
                  type="number"
                  min="0"
                  max="23"
                  value={newTimerHours}
                  onChange={e =>
                    setNewTimerHours(parseInt(e.target.value, 10) || 0)
                  }
                  data-testid="timer-hours-input"
                />
              </div>

              <div>
                <Label htmlFor="timer-minutes">Minutes</Label>
                <Input
                  id="timer-minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={newTimerMinutes}
                  onChange={e =>
                    setNewTimerMinutes(parseInt(e.target.value, 10) || 0)
                  }
                  data-testid="timer-minutes-input"
                />
              </div>

              <div>
                <Label htmlFor="timer-seconds">Seconds</Label>
                <Input
                  id="timer-seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={newTimerSeconds}
                  onChange={e =>
                    setNewTimerSeconds(parseInt(e.target.value) || 0)
                  }
                  data-testid="timer-seconds-input"
                />
              </div>

              <div>
                <Label htmlFor="alarm-count">Alarm Plays</Label>
                <Select
                  value={newTimerAlarmCount.toString()}
                  onValueChange={value =>
                    setNewTimerAlarmCount(parseInt(value, 10))
                  }
                >
                  <SelectTrigger data-testid="alarm-count-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 time</SelectItem>
                    <SelectItem value="2">2 times</SelectItem>
                    <SelectItem value="3">3 times</SelectItem>
                    <SelectItem value="-1">Until stopped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Duration: {newTimerHours > 0 ? `${newTimerHours}:` : ""}
                {newTimerMinutes}:{newTimerSeconds.toString().padStart(2, "0")}{" "}
                • Alarm: {getAlarmText(newTimerAlarmCount)}
              </div>
              <Button onClick={addTimer} data-testid="add-timer-confirm">
                <Plus className="w-4 h-4 mr-2" />
                Add Timer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Active Timers */}
      <div className="space-y-4">
        {timers.map(timer => (
          <Card
            key={timer.id}
            className={`transition-all ${timer.isFinished ? "ring-2 ring-red-500 bg-red-50 dark:bg-red-950" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <TimerIcon className="w-5 h-5 mr-2" />
                  {timer.name}
                  {timer.isFinished ? (
                    <Badge variant="destructive" className="ml-2">
                      Finished
                    </Badge>
                  ) : null}
                  {timer.isRunning ? (
                    <Badge className="ml-2">Running</Badge>
                  ) : null}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Alarm: {getAlarmText(timer.alarmCount)}
                  </div>
                  <Button
                    onClick={() => removeTimer(timer.id)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                    data-testid={`remove-timer-${timer.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div
                  className={`text-6xl font-mono font-bold ${timer.isFinished ? "text-red-600" : "text-slate-900 dark:text-slate-100"}`}
                >
                  {formatTimerTime(timer.timeLeft)}
                </div>

                <div className="flex justify-center gap-2">
                  {!timer.isFinished ? (
                    <Button
                      onClick={() => toggleTimer(timer.id)}
                      data-testid={`toggle-timer-${timer.id}`}
                    >
                      {timer.isRunning ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => stopTimer(timer.id)}
                        variant="outline"
                        data-testid={`reset-timer-${timer.id}`}
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      {alarmIntervalsRef.current.has(timer.id) && (
                        <Button
                          onClick={() => {
                            const interval = alarmIntervalsRef.current.get(
                              timer.id
                            );
                            if (interval) {
                              clearInterval(interval);
                              alarmIntervalsRef.current.delete(timer.id);
                            }
                          }}
                          variant="destructive"
                          data-testid={`stop-alarm-${timer.id}`}
                        >
                          <VolumeX className="w-4 h-4 mr-2" />
                          Stop Alarm
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Original duration: {formatTimerTime(timer.duration)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {timers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TimerIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No Timers Yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Create your first timer to get started. Default is 5 minutes.
            </p>
            <Button onClick={() => setShowAddTimer(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Timer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Timer Presets */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {timerPresets.map(preset => (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => applyPreset(preset)}
                className="h-auto p-3 text-left flex flex-col items-start"
                data-testid={`preset-${preset.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="font-medium text-sm">{preset.name}</div>
                <div className="text-xs text-slate-500">
                  {preset.hours > 0
                    ? `${preset.hours}:${preset.minutes.toString().padStart(2, "0")}:${preset.seconds.toString().padStart(2, "0")}`
                    : `${preset.minutes}:${preset.seconds.toString().padStart(2, "0")}`}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                Enter
              </kbd>
              <span>Add new timer</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                Space
              </kbd>
              <span>Start/Pause first timer</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                Escape
              </kbd>
              <span>Stop all timers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
