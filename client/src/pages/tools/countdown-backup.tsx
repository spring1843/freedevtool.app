import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Play, Pause, Square, Calendar, Volume2, VolumeX, Share, RotateCcw } from "lucide-react";
import { getParam, updateURL, copyShareableURL } from "@/lib/url-sharing";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";
import { usePersistentForm } from "@/hooks/use-persistent-state";

export default function Countdown() {
  const { fields, updateField, resetFields } = usePersistentForm('countdown', {
    targetDate: "",
    targetTime: "",
    isActive: false,
    timeRemaining: 0,
    isComplete: false,
    soundEnabled: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const { targetDate, targetTime, isActive, timeRemaining, isComplete, soundEnabled, timeZone } = fields;
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  // Initialize with tomorrow's date and current time + 1 hour
  useEffect(() => {
    // Load parameters from URL first
    const urlDate = getParam('date', '');
    const urlTime = getParam('time', '');
    const urlTimezone = getParam('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    if (urlDate && urlTime) {
      updateField('targetDate', urlDate);
      updateField('targetTime', urlTime);
      updateField('timeZone', urlTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    } else {
      // Default initialization
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const inOneHour = new Date();
      inOneHour.setHours(inOneHour.getHours() + 1);
      
      updateField('targetDate', tomorrow.toISOString().split('T')[0]);
      updateField('targetTime', inOneHour.toTimeString().slice(0, 5));
    }
  }, []);

  // Create audio context for beep
  const createAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Play beep sound
  const playBeep = () => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = createAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      console.warn('Audio playback failed');
    }
  };

  // Calculate time remaining
  const calculateTimeRemaining = () => {
    if (!targetDate || !targetTime) return 0;
    
    const now = new Date();
    const target = new Date(`${targetDate}T${targetTime}`);
    const remaining = target.getTime() - now.getTime();
    
    return Math.max(0, remaining);
  };

  // Start countdown
  const startCountdown = () => {
    const remaining = calculateTimeRemaining();
    
    if (remaining <= 0) {
      toast({
        title: "Invalid Time",
        description: "Please select a future date and time.",
        variant: "destructive"
      });
      return;
    }
    
    updateField('timeRemaining', remaining);
    updateField('isActive', true);
    updateField('isComplete', false);
    
    // Update URL with current settings
    updateURL({ date: targetDate, time: targetTime, tz: timeZone });
    
    toast({
      title: "Countdown Started",
      description: `Counting down to ${new Date(`${targetDate}T${targetTime}`).toLocaleString()}`,
    });
  };

  const shareCountdown = async () => {
    const success = await copyShareableURL({ date: targetDate, time: targetTime, tz: timeZone });
    if (success) {
      toast({
        title: "Countdown shared!",
        description: "URL copied to clipboard with target date and time",
      });
    } else {
      toast({
        title: "Share failed",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  // Pause countdown
  const pauseCountdown = () => {
    updateField('isActive', false);
  };

  // Resume countdown
  const resumeCountdown = () => {
    const remaining = calculateTimeRemaining();
    
    if (remaining <= 0) {
      updateField('isComplete', true);
      updateField('isActive', false);
      return;
    }
    
    updateField('timeRemaining', remaining);
    updateField('isActive', true);
  };

  // Stop countdown
  const stopCountdown = () => {
    updateField('isActive', false);
    updateField('timeRemaining', 0);
    updateField('isComplete', false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Countdown effect
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        const remaining = calculateTimeRemaining();
        
        if (remaining <= 0) {
          updateField('timeRemaining', 0);
          updateField('isActive', false);
          updateField('isComplete', true);
          playBeep();
          
          toast({
            title: "Time's Up!",
            description: "Your countdown has reached zero.",
          });
        } else {
          updateField('timeRemaining', remaining);
        }
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining, targetDate, targetTime, soundEnabled, toast]);

  // Format remaining time
  const formatRemainingTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } 
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
  };

  // Get quick preset options
  const getQuickPresets = () => {
    const now = new Date();
    const presets = [
      { label: "In 5 minutes", minutes: 5 },
      { label: "In 15 minutes", minutes: 15 },
      { label: "In 30 minutes", minutes: 30 },
      { label: "In 1 hour", minutes: 60 },
      { label: "In 2 hours", minutes: 120 },
      { label: "Tomorrow same time", minutes: 24 * 60 }
    ];
    
    return presets.map(preset => {
      const target = new Date(now.getTime() + preset.minutes * 60000);
      return {
        ...preset,
        date: target.toISOString().split('T')[0],
        time: target.toTimeString().slice(0, 5)
      };
    });
  };

  const presets = getQuickPresets();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="CD-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Countdown Tool
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Set a target date and time to count down to with audio notification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Set Target Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target-date">Target Date</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => updateField('targetDate', e.target.value)}
                  disabled={isActive}
                  data-testid="target-date"
                />
              </div>
              <div>
                <Label htmlFor="target-time">Target Time</Label>
                <Input
                  id="target-time"
                  type="time"
                  value={targetTime}
                  onChange={(e) => updateField('targetTime', e.target.value)}
                  disabled={isActive}
                  data-testid="target-time"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={timeZone} onValueChange={(value) => updateField('timeZone', value)}>
                <SelectTrigger data-testid="timezone-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                    Local Time Zone
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound-toggle">Sound Notification</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateField('soundEnabled', !soundEnabled)}
                data-testid="sound-toggle"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {soundEnabled ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex gap-2">
              {!isActive ? (
                <Button onClick={startCountdown} className="flex-1" data-testid="start-button">
                  <Play className="w-4 h-4 mr-2" />
                  Start Countdown
                </Button>
              ) : (
                <Button onClick={pauseCountdown} variant="outline" className="flex-1" data-testid="pause-button">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              
              {!isActive && timeRemaining > 0 && (
                <Button onClick={resumeCountdown} className="flex-1" data-testid="resume-button">
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              
              <Button onClick={stopCountdown} variant="destructive" data-testid="stop-button">
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
              
              <Button onClick={shareCountdown} variant="outline" data-testid="share-countdown-button">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={resetFields} variant="outline" data-testid="reset-countdown-button">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Countdown Display
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-6xl font-mono font-bold mb-4 ${isComplete ? 'text-red-500' : isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {isComplete ? "00:00:00" : formatRemainingTime(timeRemaining)}
              </div>
              
              {isComplete ? <div className="text-xl font-semibold text-red-500 mb-4 animate-pulse">
                  Time's Up!
                </div> : null}
              
              {targetDate && targetTime ? <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Target: {new Date(`${targetDate}T${targetTime}`).toLocaleString()}
                </div> : null}
              
              <div className={`inline-flex items-center px-3 py-1 text-sm border ${
                isActive ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                isComplete ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                {isActive ? 'Active' : isComplete ? 'Complete' : 'Stopped'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="CD-002" size="medium" />
      </div>

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {presets.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  updateField('targetDate', preset.date);
                  updateField('targetTime', preset.time);
                }}
                disabled={isActive}
                className="text-xs"
                data-testid={`preset-${index}`}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="CD-003" size="large" />
      </div>
    </div>
  );
}