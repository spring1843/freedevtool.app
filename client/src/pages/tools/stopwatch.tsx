import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Flag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import AdSlot from "@/components/ui/ad-slot";
import { SecurityBanner } from "@/components/ui/security-banner";

interface LapTime {
  lapNumber: number;
  lapTime: number;
  totalTime: number;
}

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapTime[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
  };

  const startStopwatch = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1);
    }
  };

  const pauseStopwatch = () => {
    if (isRunning && intervalRef.current) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopStopwatch = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const recordLap = () => {
    if (isRunning) {
      const lapTime =
        laps.length > 0 ? time - laps[laps.length - 1].totalTime : time;
      const newLap: LapTime = {
        lapNumber: laps.length + 1,
        lapTime,
        totalTime: time,
      };
      setLaps(prevLaps => [...prevLaps, newLap]);
    }
  };

  const handleReset = () => {
    stopStopwatch();
  };

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
          if (isRunning) {
            // Record lap when running
            if (isRunning) {
              const lapTime =
                laps.length > 0 ? time - laps[laps.length - 1].totalTime : time;
              const newLap: LapTime = {
                lapNumber: laps.length + 1,
                lapTime,
                totalTime: time,
              };
              setLaps(prevLaps => [...prevLaps, newLap]);
            }
          } else {
            // Start when stopped
            setIsRunning(true);
            intervalRef.current = setInterval(() => {
              setTime(prevTime => prevTime + 1);
            }, 1);
          }
          break;
        case " ":
          event.preventDefault();
          if (isRunning) {
            // Pause when running
            if (intervalRef.current) {
              setIsRunning(false);
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
          break;
        case "Escape":
          event.preventDefault();
          // Stop and reset
          setIsRunning(false);
          setTime(0);
          setLaps([]);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          break;
        default: {
          // Handle default case
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRunning, time, laps]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    },
    []
  );

  const fastestLap =
    laps.length > 0 ? Math.min(...laps.map(lap => lap.lapTime)) : 0;
  const slowestLap =
    laps.length > 0 ? Math.max(...laps.map(lap => lap.lapTime)) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <AdSlot position="top" id="SW-001" size="large" className="mb-6" />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Stopwatch
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              High-precision timing with millisecond accuracy and lap recording
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Keyboard: Enter (start/lap) • Space (pause) • Esc (stop)
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-6xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-4">
              {formatTime(time)}
            </div>
            <div className="flex justify-center items-center gap-2 mb-4">
              <Badge
                variant={isRunning ? "default" : "outline"}
                className="text-sm"
              >
                {isRunning ? "Running" : "Stopped"}
              </Badge>
              {laps.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  {laps.length} laps
                </Badge>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button
                onClick={startStopwatch}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
                data-testid="start-button"
              >
                <Play className="w-5 h-5 mr-2" />
                Start <span className="text-xs opacity-75 ml-2">(Enter)</span>
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseStopwatch}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  size="lg"
                  data-testid="pause-button"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause <span className="text-xs opacity-75 ml-2">(Space)</span>
                </Button>

                <Button
                  onClick={recordLap}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  data-testid="lap-button"
                >
                  <Flag className="w-5 h-5 mr-2" />
                  Lap <span className="text-xs opacity-75 ml-2">(Enter)</span>
                </Button>
              </>
            )}

            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              data-testid="stop-button"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop <span className="text-xs opacity-75 ml-2">(Esc)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {laps.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lap Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatTime(fastestLap)}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Fastest Lap
                    </div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatTime(slowestLap)}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      Slowest Lap
                    </div>
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatTime(
                      laps.reduce((sum, lap) => sum + lap.lapTime, 0) /
                        laps.length
                    )}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Average Lap
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lap Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800">
                    <tr className="border-b">
                      <th className="text-left p-2">Lap</th>
                      <th className="text-right p-2">Lap Time</th>
                      <th className="text-right p-2">Total Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laps.map(lap => (
                      <tr
                        key={lap.lapNumber}
                        className={`border-b ${
                          lap.lapTime === fastestLap
                            ? "bg-green-50 dark:bg-green-900/20"
                            : lap.lapTime === slowestLap
                              ? "bg-red-50 dark:bg-red-900/20"
                              : ""
                        }`}
                      >
                        <td className="p-2 font-medium">#{lap.lapNumber}</td>
                        <td className="text-right p-2 font-mono">
                          {formatTime(lap.lapTime)}
                        </td>
                        <td className="text-right p-2 font-mono">
                          {formatTime(lap.totalTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AdSlot position="sidebar" id="SW-002" size="medium" className="mt-6" />
    </div>
  );
}
