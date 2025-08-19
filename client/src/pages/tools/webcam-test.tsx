import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Square, RotateCcw, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { SecurityBanner } from "@/components/ui/security-banner";

export default function WebcamTest() {
  const [isActive, setIsActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [, setPermissionRequested] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const requestPermission = async () => {
    try {
      setError(null);
      setPermissionRequested(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately after getting permission

      setHasPermission(true);
      await getVideoDevices();
    } catch (err: unknown) {
      setHasPermission(false);
      const error = err as DOMException;
      if (error.name === "NotAllowedError") {
        setError(
          "Camera permission denied. Please allow camera access to use this tool."
        );
      } else if (error.name === "NotFoundError") {
        setError("No camera found. Please connect a camera device.");
      } else {
        setError(
          `Failed to access camera: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  };

  const getVideoDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        device => device.kind === "videoinput"
      );
      setDevices(videoDevices);

      if (videoDevices.length > 0 && !selectedDevice) {
        const firstDevice = videoDevices[0];
        if (firstDevice.deviceId && firstDevice.deviceId !== "") {
          setSelectedDevice(firstDevice.deviceId);
        }
      }
    } catch (err: unknown) {
      setError(
        `Failed to enumerate devices: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const startCamera = async () => {
    try {
      setError(null);

      const constraints: MediaStreamConstraints = {
        video:
          selectedDevice && selectedDevice !== ""
            ? { deviceId: selectedDevice }
            : true,
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
      setHasPermission(true);

      // Get updated device list with labels
      await getVideoDevices();
    } catch (err: unknown) {
      setError(
        `Camera access failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
      setHasPermission(false);
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    // Create download link
    canvas.toBlob(blob => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `camera-capture-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleReset = () => {
    stopCamera();
    setSelectedDevice(undefined);
    setError(null);
    setHasPermission(null);
    setPermissionRequested(false);
    setDevices([]);
  };

  useEffect(() => {
    // Only get basic device info without permission on mount
    const getBasicDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          device => device.kind === "videoinput"
        );
        if (videoDevices.length > 0) {
          setDevices(videoDevices);
        }
      } catch (err: unknown) {
        setError(
          `Failed to get basic devices: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    };

    getBasicDevices();

    return () => {
      stopCamera();
    };
  }, []);

  const getPermissionStatus = () => {
    if (hasPermission === null)
      return { color: "text-gray-600", text: "Unknown" };
    if (hasPermission) return { color: "text-green-600", text: "Granted" };
    return { color: "text-red-600", text: "Denied" };
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Camera Test
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Test your camera functionality and capture photos
            </p>
          </div>
          <SecurityBanner variant="compact" />
        </div>
      </div>

      {error ? (
        <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Camera Controls
            <Badge variant="outline" className={permissionStatus.color}>
              Permission: {permissionStatus.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="device-select">Camera Device</Label>
            <Select
              value={selectedDevice || ""}
              onValueChange={setSelectedDevice}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select camera device..." />
              </SelectTrigger>
              <SelectContent>
                {devices.map(device => (
                  <SelectItem
                    key={device.deviceId}
                    value={
                      device.deviceId ||
                      `device-${Math.random().toString(36).substr(2, 9)}`
                    }
                  >
                    {device.label ||
                      `Camera ${device.deviceId?.slice(0, 8) || "Unknown"}...`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {devices.length === 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                No camera devices found. Please ensure a camera is connected.
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!hasPermission ? (
              <Button
                onClick={requestPermission}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Request Camera Permission
              </Button>
            ) : !isActive ? (
              <Button
                onClick={startCamera}
                disabled={devices.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button
                onClick={stopCamera}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Camera
              </Button>
            )}

            <Button
              onClick={capturePhoto}
              disabled={!isActive}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Capture Photo
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
          <CardTitle>Camera Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative bg-black rounded-lg overflow-hidden"
            style={{ aspectRatio: "16/9" }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center text-gray-600 dark:text-gray-400">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <div>Camera preview will appear here</div>
                  <div className="text-sm mt-2">
                    Click "Start Camera" to begin
                  </div>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {isActive ? (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-300">
                  Status
                </div>
                <div className="text-green-600 dark:text-green-400">
                  Camera Active
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-semibold text-blue-700 dark:text-blue-300">
                  Resolution
                </div>
                <div className="text-blue-600 dark:text-blue-400">
                  {videoRef.current?.videoWidth}x{videoRef.current?.videoHeight}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Privacy Notice:
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>• All camera processing happens locally in your browser</div>
          <div>• No video or image data is transmitted to any server</div>
          <div>• Captured photos are saved directly to your device</div>
          <div>
            • Camera access requires explicit permission from your browser
          </div>
        </div>
      </div>
    </div>
  );
}
