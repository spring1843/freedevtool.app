import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  MicOff,
  Play,
  Square,
  Download,
  RefreshCw,
  Volume2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { SecurityBanner } from "@/components/ui/security-banner";

export default function MicrophoneTest() {
  const [isListening, setIsListening] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(
    undefined
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [, setPermissionRequested] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const requestPermission = async () => {
    try {
      setError("");
      setPermissionRequested(true);

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately after getting permission

      setHasPermission(true);
      await getDevices();

      toast({
        title: "Permission Granted",
        description:
          "Microphone access has been granted. You can now test your microphone.",
      });
    } catch (err: any) {
      setHasPermission(false);
      let errorMessage = "Microphone permission denied.";

      if (err.name === "NotAllowedError") {
        errorMessage =
          "Microphone permission denied. Please allow microphone access to use this tool.";
      } else if (err.name === "NotFoundError") {
        errorMessage =
          "No microphone found. Please connect a microphone device.";
      } else {
        errorMessage = `Failed to access microphone: ${err?.message || "Unknown error"}`;
      }

      setError(errorMessage);
      toast({
        title: "Permission Denied",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = deviceList.filter(
        device => device.kind === "audioinput"
      );
      setDevices(audioDevices);
      if (audioDevices.length > 0 && !selectedDevice) {
        const firstDevice = audioDevices[0];
        if (firstDevice.deviceId && firstDevice.deviceId !== "") {
          setSelectedDevice(firstDevice.deviceId);
        }
      }
    } catch (err: any) {
      setError(
        `Failed to enumerate devices: ${err?.message || "Please check microphone permissions"}`
      );
    }
  };

  // Get basic device info without permission on mount
  useEffect(() => {
    const getBasicDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = deviceList.filter(
          device => device.kind === "audioinput"
        );
        if (audioDevices.length > 0) {
          setDevices(audioDevices);
        }
      } catch (err: any) {
        setError(
          `Failed to enumerate devices: ${err?.message || "Please check microphone permissions"}`
        );
      }
    };

    getBasicDevices();
  }, []);

  // Audio level monitoring
  const updateAudioLevel = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    setAudioLevel(Math.round((average / 255) * 100));

    if (isListening) {
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  // Start microphone
  const startMicrophone = async () => {
    try {
      setError("");
      const constraints: MediaStreamConstraints = {
        audio:
          selectedDevice && selectedDevice !== ""
            ? {
                deviceId: { exact: selectedDevice },
              }
            : true,
        video: false,
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      // Set up audio analysis
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(mediaStream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setIsListening(true);
      updateAudioLevel();

      toast({
        title: "Microphone Started",
        description:
          "Your microphone is now active and monitoring audio levels.",
      });
    } catch (err: any) {
      let errorMessage = "Unknown error";

      if (err.name === "NotAllowedError") {
        errorMessage =
          "Permission denied. Please allow microphone access in your browser.";
      } else if (err.name === "NotFoundError") {
        errorMessage =
          "No microphone found. Please connect a microphone device.";
      } else if (err.name === "NotReadableError") {
        errorMessage = "Microphone is already in use by another application.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage = "Selected microphone device is not available.";
      } else if (err.name === "SecurityError") {
        errorMessage =
          "Microphone access is blocked due to security restrictions.";
      } else {
        errorMessage = err.message || "Failed to access microphone";
      }

      setError(`Microphone access failed: ${errorMessage}`);
      toast({
        title: "Microphone Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Stop microphone
  const stopMicrophone = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (isRecording) {
      stopRecording();
    }

    setIsListening(false);
    setAudioLevel(0);
    setError("");

    toast({
      title: "Microphone Stopped",
      description: "Your microphone has been turned off.",
    });
  };

  // Start recording
  const startRecording = () => {
    if (!stream) return;

    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      toast({
        title: "Recording Started",
        description: "Audio recording is now in progress.",
      });
    } catch {
      setError(
        "Recording failed. Your browser may not support audio recording."
      );
      toast({
        title: "Recording Error",
        description: "Failed to start audio recording.",
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      toast({
        title: "Recording Stopped",
        description: "Audio recording completed successfully.",
      });
    }
  };

  // Play recorded audio
  const playRecording = () => {
    if (!recordedBlob) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    const url = URL.createObjectURL(recordedBlob);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
    }
  };

  // Download recorded audio
  const downloadRecording = () => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `microphone-recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your recording is being downloaded.",
    });
  };

  // Refresh device list
  const refreshDevices = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    try {
      await getDevices();
      toast({
        title: "Devices Refreshed",
        description: `Found ${devices.length} microphone(s).`,
      });
    } catch (err: any) {
      setError(
        `Failed to refresh devices: ${err?.message || "Please check microphone permissions"}`
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Microphone Test
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Test your microphone, monitor audio levels, and record audio clips
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              Microphone Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Select Microphone
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedDevice || ""}
                  onValueChange={setSelectedDevice}
                >
                  <SelectTrigger
                    className="flex-1"
                    data-testid="microphone-select"
                  >
                    <SelectValue placeholder="Choose microphone..." />
                  </SelectTrigger>
                  <SelectContent>
                    {devices
                      .filter(
                        device => device.deviceId && device.deviceId.length > 0
                      )
                      .map(device => (
                        <SelectItem
                          key={device.deviceId}
                          value={
                            device.deviceId ||
                            `device-${Math.random().toString(36).substr(2, 9)}`
                          }
                        >
                          {device.label ||
                            `Microphone ${device.deviceId?.slice(0, 8) || "Unknown"}...`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshDevices}
                  data-testid="refresh-devices"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {!hasPermission ? (
                <Button
                  onClick={requestPermission}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="request-microphone-permission"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Request Microphone Permission
                </Button>
              ) : !isListening ? (
                <Button
                  onClick={startMicrophone}
                  className="w-full"
                  data-testid="start-microphone"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Start Microphone Test
                </Button>
              ) : (
                <Button
                  onClick={stopMicrophone}
                  variant="destructive"
                  className="w-full"
                  data-testid="stop-microphone"
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Microphone Test
                </Button>
              )}

              {isListening && !isRecording ? (
                <Button
                  onClick={startRecording}
                  variant="outline"
                  className="w-full"
                  data-testid="start-recording"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              ) : null}

              {isRecording ? (
                <Button
                  onClick={stopRecording}
                  variant="outline"
                  className="w-full"
                  data-testid="stop-recording"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              ) : null}
            </div>

            {recordedBlob ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={playRecording}
                    variant="outline"
                    className="flex-1"
                    data-testid="play-recording"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isPlaying ? "Stop Playback" : "Play Recording"}
                  </Button>
                  <Button
                    onClick={downloadRecording}
                    variant="outline"
                    data-testid="download-recording"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <audio ref={audioRef} style={{ display: "none" }} />
              </div>
            ) : null}

            {error ? (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p>
                <strong>Status:</strong>{" "}
                {isListening
                  ? isRecording
                    ? "Recording"
                    : "Active"
                  : "Inactive"}
              </p>
              <p>
                <strong>Devices:</strong> {devices.length} microphone(s) found
              </p>
              {recordedBlob ? (
                <p>
                  <strong>Recording:</strong>{" "}
                  {(recordedBlob.size / 1024).toFixed(2)} KB
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Audio Level Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Volume2 className="w-5 h-5 mr-2" />
              Audio Level Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-mono font-bold mb-4 text-blue-600 dark:text-blue-400">
                  {audioLevel}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Current Audio Level
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Silent</span>
                  <span>Loud</span>
                </div>
                <Progress
                  value={audioLevel}
                  className="w-full h-3"
                  data-testid="audio-level-bar"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs text-center text-slate-600 dark:text-slate-400">
                <div
                  className={
                    audioLevel < 25
                      ? "text-green-600 dark:text-green-400 font-semibold"
                      : ""
                  }
                >
                  Quiet
                  <br />
                  0-25%
                </div>
                <div
                  className={
                    audioLevel >= 25 && audioLevel < 50
                      ? "text-yellow-600 dark:text-yellow-400 font-semibold"
                      : ""
                  }
                >
                  Normal
                  <br />
                  25-50%
                </div>
                <div
                  className={
                    audioLevel >= 50 && audioLevel < 75
                      ? "text-orange-600 dark:text-orange-400 font-semibold"
                      : ""
                  }
                >
                  Loud
                  <br />
                  50-75%
                </div>
                <div
                  className={
                    audioLevel >= 75
                      ? "text-red-600 dark:text-red-400 font-semibold"
                      : ""
                  }
                >
                  Very Loud
                  <br />
                  75-100%
                </div>
              </div>

              {!isListening && (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                  <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Microphone Inactive</p>
                  <p className="text-sm">
                    Start microphone test to see audio levels
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center my-8" />

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Testing Your Microphone:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Select your microphone from the dropdown</li>
                <li>• Click "Start Microphone Test" to begin</li>
                <li>• Speak into your microphone</li>
                <li>• Watch the audio level meter respond</li>
                <li>• Try different microphones if available</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Recording & Playback:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Record test clips to check quality</li>
                <li>• Play back recordings immediately</li>
                <li>• Download recordings for analysis</li>
                <li>• Monitor recording file size</li>
              </ul>
            </div>
          </div>
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Privacy Note:</strong> This tool runs entirely in your
              browser. No audio data is sent to any server. Your browser will
              request microphone permission when you first start the test.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8" />
    </div>
  );
}
