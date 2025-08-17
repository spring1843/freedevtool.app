import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CameraOff, Video, VideoOff, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ui/ad-slot";
import { usePersistentForm } from "@/hooks/use-persistent-state";

export default function CameraTest() {
  const { fields, updateField } = usePersistentForm('camera-test', {
    isActive: false,
    devices: [] as MediaDeviceInfo[],
    selectedDevice: "",
    error: "",
    isRecording: false
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Get available video devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permission first to get device labels
        await navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          stream.getTracks().forEach(track => track.stop());
        });
        
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
        updateField('devices', videoDevices);
        if (videoDevices.length > 0 && !fields.selectedDevice) {
          updateField('selectedDevice', videoDevices[0].deviceId);
        }
      } catch {
        // Fallback: try without permission request
        try {
          const deviceList = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
          updateField('devices', videoDevices);
          if (videoDevices.length > 0 && !fields.selectedDevice) {
            updateField('selectedDevice', videoDevices[0].deviceId);
          }
        } catch {
          updateField('error', "Failed to enumerate devices. Please check camera permissions.");
        }
      }
    };
    
    getDevices();
  }, [fields.selectedDevice, updateField]);

  // Start webcam
  const startWebcam = async () => {
    try {
      updateField('error', '');
      const constraints: MediaStreamConstraints = {
        video: fields.selectedDevice ? { deviceId: fields.selectedDevice } : true,
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays immediately
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {
            console.warn('Autoplay failed');
          });
        };
      }
      
      updateField('isActive', true);
      toast({
        title: "Camera Started",
        description: "Your camera is now active and streaming.",
      });
    } catch {
      const errorMessage = "Failed to access webcam";
      updateField('error', `Camera access failed: ${errorMessage}. Please check your permissions and ensure no other app is using the camera.`);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (fields.isRecording) {
      stopRecording();
    }
    
    updateField('isActive', false);
    updateField('error', '');
    
    toast({
      title: "Webcam Stopped",
      description: "Your webcam has been turned off.",
    });
  };

  // Start recording
  const startRecording = () => {
    if (!stream) return;
    
    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      updateField('isRecording', true);
      
      toast({
        title: "Recording Started",
        description: "Video recording is now in progress.",
      });
    } catch {
      updateField('error', "Recording failed. Your browser may not support video recording.");
      toast({
        title: "Recording Error",
        description: "Failed to start video recording.",
        variant: "destructive"
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && fields.isRecording) {
      mediaRecorderRef.current.stop();
      updateField('isRecording', false);
      
      toast({
        title: "Recording Stopped",
        description: "Video recording completed successfully.",
      });
    }
  };

  // Download recorded video
  const downloadRecording = () => {
    if (!recordedBlob) return;
    
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camera-recording-${Date.now()}.webm`;
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
    try {
      // Request permissions first to get device labels
      await navigator.mediaDevices.getUserMedia({ video: true });
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      updateField('devices', videoDevices);
      
      toast({
        title: "Devices Refreshed",
        description: `Found ${videoDevices.length} camera(s).`,
      });
    } catch {
      updateField('error', "Failed to refresh devices. Please check camera permissions.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Ad */}
      <AdSlot position="top" id="WC-001" size="large" className="mb-6" />
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
          Camera Test
          <span className="text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded font-medium">
            EXPERIMENTAL
          </span>
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Test your camera, switch between devices, and record video clips
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Camera Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Select Camera
              </label>
              <div className="flex gap-2">
                <Select value={fields.selectedDevice} onValueChange={(value) => updateField('selectedDevice', value)}>
                  <SelectTrigger className="flex-1" data-testid="camera-select">
                    <SelectValue placeholder="Choose camera..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.devices.filter(device => device.deviceId && device.deviceId.length > 0).map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
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
              {!fields.isActive ? (
                <Button onClick={startWebcam} className="w-full" data-testid="start-webcam">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopWebcam} variant="destructive" className="w-full" data-testid="stop-webcam">
                  <CameraOff className="w-4 h-4 mr-2" />
                  Stop Camera
                </Button>
              )}
              
              {fields.isActive && !fields.isRecording ? <Button onClick={startRecording} variant="outline" className="w-full" data-testid="start-recording">
                  <Video className="w-4 h-4 mr-2" />
                  Start Recording
                </Button> : null}
              
              {fields.isRecording ? <Button onClick={stopRecording} variant="outline" className="w-full" data-testid="stop-recording">
                  <VideoOff className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button> : null}
              
              {recordedBlob ? <Button onClick={downloadRecording} variant="outline" className="w-full" data-testid="download-recording">
                  <Download className="w-4 h-4 mr-2" />
                  Download Recording
                </Button> : null}
            </div>

            {fields.error ? <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  {fields.error}
                </AlertDescription>
              </Alert> : null}

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p><strong>Status:</strong> {fields.isActive ? (fields.isRecording ? 'Recording' : 'Active') : 'Inactive'}</p>
              <p><strong>Devices:</strong> {fields.devices.length} camera(s) found</p>
              {recordedBlob ? <p><strong>Recording:</strong> {(recordedBlob.size / 1024 / 1024).toFixed(2)} MB</p> : null}
            </div>
          </CardContent>
        </Card>

        {/* Video Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-slate-100 dark:bg-slate-800 aspect-video border border-slate-200 dark:border-slate-700 overflow-hidden">
              {fields.isActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    data-testid="video-preview"
                  />
                  {fields.isRecording ? <div className="absolute top-4 right-4 flex items-center bg-red-600 text-white px-3 py-1 text-sm font-medium">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      REC
                    </div> : null}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Camera Inactive</p>
                    <p className="text-sm">Click "Start Camera" to begin testing</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Ad */}
      <div className="flex justify-center my-8">
        <AdSlot position="middle" id="WC-002" size="medium" />
      </div>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Testing Your Camera:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Select your camera from the dropdown</li>
                <li>• Click "Start Camera" to begin testing</li>
                <li>• Check if video appears in the preview</li>
                <li>• Try different cameras if you have multiple</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Recording Features:</h4>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                <li>• Record short test clips</li>
                <li>• Download recordings as WebM files</li>
                <li>• Monitor file size and recording status</li>
                <li>• Recordings work in modern browsers</li>
              </ul>
            </div>
          </div>
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Privacy Note:</strong> This tool runs entirely in your browser. No video data is sent to any server. 
              Your browser will request camera permission when you first start the camera.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bottom Ad */}
      <div className="flex justify-center mt-8">
        <AdSlot position="bottom" id="WC-003" size="large" />
      </div>
    </div>
  );
}