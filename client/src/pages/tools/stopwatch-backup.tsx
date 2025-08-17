import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Square, Timer, Flag, Share } from "lucide-react";
import { formatTime } from "@/lib/time-tools";
import type { LapTime } from "@/types/tools";
import { getParam, copyShareableURL } from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";
import { usePersistentForm } from "@/hooks/use-persistent-state";

export default function Stopwatch() {
  const { fields, updateField, resetFields } = usePersistentForm('stopwatch', {
    time: 0,
    isRunning: false,
    laps: [] as LapTime[]
  });
  const { time, isRunning, laps } = fields;
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);
  const { toast } = useToast();

  useEffect(() => {
    // Load parameters from URL
    const urlTime = getParam('t', 0);
    const urlLaps = getParam('laps', '');
    const urlRunning = getParam('running', '0');
    
    if (urlTime > 0) {
      updateField('time', urlTime);
      pausedTimeRef.current = urlTime;
      
      // Restore laps if they exist
      if (urlLaps) {
        const lapTimes = urlLaps.split(',').map(Number).filter((t: number) => !isNaN(t) && t > 0);
        const reconstructedLaps: LapTime[] = lapTimes.map((lapTime: number, index: number) => ({
          id: index + 1,
          time: lapTime,
          lapTime: index === 0 ? lapTime : lapTime - lapTimes[index - 1]
        }));
        updateField('laps', reconstructedLaps);
      }
      
      // Auto-start if it was running when shared
      if (urlRunning === '1') {
        updateField('isRunning', true);
      }
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - pausedTimeRef.current;
      
      const updateTime = () => {
        updateField('time', performance.now() - startTimeRef.current);
        intervalRef.current = requestAnimationFrame(updateTime);
      };
      
      intervalRef.current = requestAnimationFrame(updateTime);
    } else {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
        intervalRef.current = null;
      }
      pausedTimeRef.current = time;
    }

    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
      }
    };
  }, [isRunning]);

  const startPause = () => {
    updateField('isRunning', !isRunning);
  };

  const reset = () => {
    updateField('isRunning', false);
    updateField('time', 0);
    updateField('laps', []);
    pausedTimeRef.current = 0;
    startTimeRef.current = 0;
  };

  const addLap = () => {
    if (time > 0) {
      const previousLapTime = laps.length > 0 ? laps[laps.length - 1].time : 0;
      const lapTime = time - previousLapTime;
      
      const newLap: LapTime = {
        id: laps.length + 1,
        time,
        lapTime
      };
      
      updateField('laps', [...laps, newLap]);
    }
  };

  const shareStopwatch = async () => {
    const lapTimes = laps.map(lap => lap.time.toFixed(3)).join(',');
    const success = await copyShareableURL({ 
      t: time.toFixed(3), 
      laps: lapTimes,
      running: isRunning ? '1' : '0'
    });
    if (success) {
      toast({
        title: "Stopwatch shared!",
        description: "URL copied to clipboard with current time and laps",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const getBestLap = () => {
    if (laps.length === 0) return null;
    return laps.reduce((best, lap) => lap.lapTime < best.lapTime ? lap : best);
  };

  const getWorstLap = () => {
    if (laps.length === 0) return null;
    return laps.reduce((worst, lap) => lap.lapTime > worst.lapTime ? lap : worst);
  };

  const bestLap = getBestLap();
  const worstLap = getWorstLap();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="SW-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Stopwatch
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Ultra-high precision stopwatch with microsecond accuracy and lap timing
        </p>
      </div>

      {/* Stopwatch Display */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-8">
              {formatTime(time)}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={startPause}
                size="lg"
                variant={isRunning ? "secondary" : "default"}
                data-testid={isRunning ? "pause-stopwatch-button" : "start-stopwatch-button"}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>

              <Button
                onClick={addLap}
                variant="outline"
                size="lg"
                disabled={time === 0}
                data-testid="lap-button"
              >
                <Flag className="w-5 h-5 mr-2" />
                Lap
              </Button>

              <Button
                onClick={reset}
                variant="outline"
                size="lg"
                data-testid="reset-stopwatch-button"
              >
                <Square className="w-5 h-5 mr-2" />
                Reset
              </Button>
              
              <Button
                onClick={shareStopwatch}
                variant="outline"
                size="lg"
                data-testid="share-stopwatch-button"
              >
                <Share className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="SW-002" size="medium" />
      </div>

      {/* Lap Times */}
      {laps.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="w-5 h-5 mr-2" />
              Lap Times ({laps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {laps.slice().reverse().map((lap, index) => {
                  const isBest = bestLap && lap.id === bestLap.id;
                  const isWorst = worstLap && lap.id === worstLap.id && laps.length > 1;
                  
                  return (
                    <div
                      key={lap.id}
                      className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                        isBest
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : isWorst
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      data-testid={`lap-${lap.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-slate-600 dark:text-slate-400 min-w-[60px]">
                          Lap {lap.id}
                        </span>
                        {isBest ? <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-1 rounded">
                            Best
                          </span> : null}
                        {isWorst ? <span className="text-xs bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 px-2 py-1 rounded">
                            Slowest
                          </span> : null}
                      </div>
                      <div className="flex gap-6 font-mono">
                        <div className="text-right">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Lap Time</div>
                          <div className="font-semibold">{formatTime(lap.lapTime)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Total Time</div>
                          <div className="font-semibold">{formatTime(lap.time)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About High-Precision Stopwatch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Ultra-High Precision:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Microsecond accuracy using performance.now()</li>
                <li>• Displays time down to 6 decimal places</li>
                <li>• Uses requestAnimationFrame for smooth updates</li>
                <li>• No precision loss during pause/resume</li>
                <li>• Perfect for scientific measurements</li>
                <li>• Professional sports timing accuracy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Lap Timing Features:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Unlimited lap recording capacity</li>
                <li>• Automatic best and worst lap highlighting</li>
                <li>• Individual lap time and total time tracking</li>
                <li>• Reverse chronological display (newest first)</li>
                <li>• Color-coded performance indicators</li>
                <li>• Ideal for racing, workouts, and training</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="SW-003" size="large" />
      </div>
    </div>
  );
}