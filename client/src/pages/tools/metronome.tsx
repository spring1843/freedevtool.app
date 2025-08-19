import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Square,
  Music,
  Plus,
  Trash2,
  Volume2,
  Share,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { getParam, copyShareableURL } from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";
import { SecurityBanner } from "@/components/ui/security-banner";

interface ToneSchedule {
  id: string;
  note: string;
  frequency: number;
  intervalSeconds: number;
  enabled: boolean;
}

// Musical note frequencies (4th octave)
const NOTES = {
  C4: 261.63,
  "C#4/Db4": 277.18,
  D4: 293.66,
  "D#4/Eb4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4/Gb4": 369.99,
  G4: 392.0,
  "G#4/Ab4": 415.3,
  A4: 440.0,
  "A#4/Bb4": 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
};

export default function Metronome() {
  const [toneSchedules, setToneSchedules] = useState<ToneSchedule[]>([
    {
      id: "1",
      note: "A4",
      frequency: 440.0,
      intervalSeconds: 0.5, // Default: 120 BPM
      enabled: true,
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playingTones, setPlayingTones] = useState<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const toneTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isRunningRef = useRef(false);
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
          if (!isRunning) {
            startMetronome();
          }
          break;
        case " ":
          event.preventDefault();
          if (isRunning) {
            stopMetronome();
          } else {
            startMetronome();
          }
          break;
        case "Escape":
          event.preventDefault();
          stopMetronome();
          break;
        default: {
          // Handle default case
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  useEffect(() => {
    // Load parameters from URL
    const urlTones = getParam("tones", "");
    if (urlTones) {
      try {
        const tonesData = JSON.parse(decodeURIComponent(urlTones));
        if (Array.isArray(tonesData)) {
          setToneSchedules(tonesData);
        }
      } catch {
        console.warn("Failed to parse tones from URL");
      }
    }
  }, []);

  const shareMetronome = async () => {
    const tonesData = encodeURIComponent(JSON.stringify(toneSchedules));
    const success = await copyShareableURL({ tones: tonesData });
    if (success) {
      toast({
        title: "Metronome shared!",
        description: "URL copied to clipboard with current tone schedules",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext)();
    }

    // Capture ref values at effect time to avoid stale closures
    const currentTimeouts = toneTimeoutsRef.current;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      // Clear all timeouts using captured value
      currentTimeouts.forEach((timeout: NodeJS.Timeout) =>
        clearTimeout(timeout)
      );
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const playTone = (frequency: number, scheduleId: string, duration = 200) => {
    if (!audioContextRef.current) return;

    // Add visual effect
    setPlayingTones(prev => new Set(prev).add(scheduleId));

    // Remove visual effect after duration
    setTimeout(() => {
      setPlayingTones(prev => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });
    }, duration);

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(
      frequency,
      audioContextRef.current.currentTime
    );
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.3,
      audioContextRef.current.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current.currentTime + duration / 1000
    );

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  };

  const scheduleNextTone = useCallback(
    (schedule: ToneSchedule, startTime: number) => {
      if (!schedule.enabled || !isRunningRef.current) return;

      const nextPlayTime = startTime + schedule.intervalSeconds * 1000;
      const delay = nextPlayTime - Date.now();

      if (delay > 0) {
        const timeout = setTimeout(() => {
          if (isRunningRef.current) {
            playTone(schedule.frequency, schedule.id);
            scheduleNextTone(schedule, nextPlayTime);
          }
        }, delay);

        toneTimeoutsRef.current.set(schedule.id, timeout);
      }
    },
    []
  );

  const startMetronome = useCallback(() => {
    if (!audioContextRef.current) return;

    // Resume audio context if suspended
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    setIsRunning(true);
    isRunningRef.current = true;
    const startTime = Date.now();

    // Start timing counter
    intervalRef.current = setInterval(() => {
      setCurrentTime(Date.now() - startTime);
    }, 100);

    // Schedule each enabled tone
    toneSchedules.forEach(schedule => {
      if (schedule.enabled) {
        // Play immediately
        playTone(schedule.frequency, schedule.id);
        // Schedule subsequent tones
        scheduleNextTone(schedule, startTime);
      }
    });
  }, [toneSchedules, scheduleNextTone]);

  const stopMetronome = useCallback(() => {
    setIsRunning(false);
    isRunningRef.current = false;
    setCurrentTime(0);

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear all tone timeouts
    toneTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    toneTimeoutsRef.current.clear();
  }, []);

  const addToneSchedule = () => {
    const newId = Date.now().toString();
    const newSchedule: ToneSchedule = {
      id: newId,
      note: "G4",
      frequency: 392.0,
      intervalSeconds: 2,
      enabled: true,
    };
    setToneSchedules([...toneSchedules, newSchedule]);
  };

  const removeToneSchedule = (id: string) => {
    if (toneSchedules.length > 1) {
      setToneSchedules(toneSchedules.filter(schedule => schedule.id !== id));
      // Clear timeout for removed schedule
      const timeout = toneTimeoutsRef.current.get(id);
      if (timeout) {
        clearTimeout(timeout);
        toneTimeoutsRef.current.delete(id);
      }
    }
  };

  const updateToneSchedule = (id: string, updates: Partial<ToneSchedule>) => {
    setToneSchedules(
      toneSchedules.map(schedule =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      )
    );
  };

  const testTone = (frequency: number, scheduleId: string) => {
    if (!audioContextRef.current) return;

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    playTone(frequency, scheduleId, 300);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Multi-Tone Metronome
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Create custom rhythm patterns with multiple musical notes at
              different intervals
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Keyboard: Enter (start) • Space/Esc (stop)
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      {/* Unified Metronome Interface */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Music className="w-5 h-5 mr-2" />
              Multi-Tone Metronome
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-lg font-mono text-slate-600 dark:text-slate-400">
                {formatTime(currentTime)}
              </div>
              <Badge variant={isRunning ? "default" : "secondary"}>
                {isRunning ? "Running" : "Stopped"}
              </Badge>
            </div>
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Configure multiple tones with different intervals to create complex
            rhythm patterns
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Controls */}
          <div className="flex gap-4 items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            {!isRunning ? (
              <Button
                onClick={startMetronome}
                disabled={toneSchedules.filter(s => s.enabled).length === 0}
                size="lg"
                className="flex items-center space-x-2"
                data-testid="start-button"
              >
                <Play className="w-5 h-5" />
                <span>Start (Enter)</span>
              </Button>
            ) : (
              <Button
                onClick={stopMetronome}
                variant="destructive"
                size="lg"
                className="flex items-center space-x-2"
                data-testid="stop-button"
              >
                <Square className="w-5 h-5" />
                <span>Stop (Space/Esc)</span>
              </Button>
            )}

            <Button
              onClick={shareMetronome}
              variant="outline"
              className="flex items-center space-x-2"
              data-testid="share-metronome-button"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>

          {toneSchedules.filter(s => s.enabled).length === 0 && (
            <Alert>
              <AlertDescription>
                Please enable at least one tone below to start the metronome.
                Each tone will play at its configured interval.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Tone Configuration Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Tone Configuration (
                {toneSchedules.filter(s => s.enabled).length} active)
              </h3>
              <Button
                onClick={addToneSchedule}
                size="sm"
                className="flex items-center space-x-1"
                data-testid="add-tone-button"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tone</span>
              </Button>
            </div>

            <div className="grid gap-4">
              {toneSchedules.map((schedule, index) => (
                <div
                  key={schedule.id}
                  className={`p-5 border rounded-lg transition-all duration-300 ${
                    playingTones.has(schedule.id)
                      ? "border-green-400 dark:border-green-500 bg-green-100/70 dark:bg-green-900/30 shadow-lg scale-105 ring-2 ring-green-300 dark:ring-green-600"
                      : schedule.enabled
                        ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  }`}
                  data-testid={`tone-schedule-${index}`}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={checked => {
                          updateToneSchedule(schedule.id, { enabled: checked });
                        }}
                        data-testid={`enabled-switch-${index}`}
                      />
                      <div>
                        <h4
                          className={`font-medium transition-colors duration-300 ${
                            playingTones.has(schedule.id)
                              ? "text-green-800 dark:text-green-200 font-bold"
                              : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          Tone #{index + 1}{" "}
                          {playingTones.has(schedule.id) && "🎵"}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {schedule.enabled ? (
                            <>
                              Playing {schedule.note} every{" "}
                              {schedule.intervalSeconds}s
                            </>
                          ) : (
                            <>Disabled</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          testTone(schedule.frequency, schedule.id)
                        }
                        className="flex items-center space-x-1"
                        data-testid={`test-tone-${index}`}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Test</span>
                      </Button>
                      {toneSchedules.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeToneSchedule(schedule.id)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`remove-tone-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Configuration Controls */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor={`note-${schedule.id}`}
                        className="text-sm font-medium mb-2 block"
                      >
                        Musical Note & Frequency
                      </Label>
                      <Select
                        value={schedule.note}
                        onValueChange={value => {
                          updateToneSchedule(schedule.id, {
                            note: value,
                            frequency: NOTES[value as keyof typeof NOTES],
                          });
                        }}
                      >
                        <SelectTrigger data-testid={`note-select-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(NOTES).map(([note, freq]) => (
                            <SelectItem key={note} value={note}>
                              {note} ({freq.toFixed(2)} Hz)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor={`interval-${schedule.id}`}
                        className="text-sm font-medium mb-2 block"
                      >
                        Interval: {schedule.intervalSeconds}s
                      </Label>
                      <div className="space-y-2">
                        <Slider
                          value={[schedule.intervalSeconds]}
                          onValueChange={value => {
                            updateToneSchedule(schedule.id, {
                              intervalSeconds: value[0],
                            });
                          }}
                          min={0.1}
                          max={10}
                          step={0.1}
                          className="w-full"
                          data-testid={`interval-slider-${index}`}
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>0.1s</span>
                          <span>10s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Label className="text-sm font-medium mb-2 block">
                      Quick Interval Presets:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[0.5, 1, 1.5, 2, 3, 4].map(interval => (
                        <Button
                          key={interval}
                          size="sm"
                          variant={
                            schedule.intervalSeconds === interval
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            updateToneSchedule(schedule.id, {
                              intervalSeconds: interval,
                            })
                          }
                          className="text-xs px-3 py-1"
                        >
                          {interval}s
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start & Examples */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Start & Rhythm Examples</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Load pre-configured rhythm patterns or learn how to create your own
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Example Patterns */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Example Patterns
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setToneSchedules([
                      {
                        id: "1",
                        note: "C5",
                        frequency: NOTES["C5"],
                        intervalSeconds: 1,
                        enabled: true,
                      },
                      {
                        id: "2",
                        note: "G4",
                        frequency: NOTES["G4"],
                        intervalSeconds: 2,
                        enabled: true,
                      },
                    ]);
                  }}
                  className="w-full justify-start"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Basic Beat (C5 + G4)
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setToneSchedules([
                      {
                        id: "1",
                        note: "A4",
                        frequency: NOTES["A4"],
                        intervalSeconds: 0.5,
                        enabled: true,
                      },
                      {
                        id: "2",
                        note: "E4",
                        frequency: NOTES["E4"],
                        intervalSeconds: 2,
                        enabled: true,
                      },
                      {
                        id: "3",
                        note: "A5",
                        frequency: NOTES["A5"],
                        intervalSeconds: 4,
                        enabled: true,
                      },
                    ]);
                  }}
                  className="w-full justify-start"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Complex Rhythm (3 Tones)
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setToneSchedules([
                      {
                        id: "1",
                        note: "C4",
                        frequency: NOTES["C4"],
                        intervalSeconds: 1,
                        enabled: true,
                      },
                      {
                        id: "2",
                        note: "E4",
                        frequency: NOTES["E4"],
                        intervalSeconds: 1.5,
                        enabled: true,
                      },
                      {
                        id: "3",
                        note: "G4",
                        frequency: NOTES["G4"],
                        intervalSeconds: 2,
                        enabled: true,
                      },
                      {
                        id: "4",
                        note: "C5",
                        frequency: NOTES["C5"],
                        intervalSeconds: 3,
                        enabled: true,
                      },
                    ]);
                  }}
                  className="w-full justify-start"
                >
                  <Music className="w-4 h-4 mr-2" />C Major Chord Progression
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                How to Use
              </h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    1
                  </span>
                  <p>Click "Test" to preview each tone before starting</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    2
                  </span>
                  <p>Configure notes and intervals using the controls below</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    3
                  </span>
                  <p>Toggle tones on/off using the switches</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    4
                  </span>
                  <p>Click "Start Metronome" - first tones play immediately</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                    5
                  </span>
                  <p>Add multiple tones for complex rhythm patterns</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
                  💡 Pro Tip:
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Use different interval combinations like 0.5s, 1.5s, and 3s to
                  create polyrhythmic patterns that repeat every 6 seconds.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
