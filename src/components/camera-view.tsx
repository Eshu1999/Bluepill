
'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Camera, Upload, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';

interface CameraViewProps {
  onImageReady: (dataUri: string) => void;
}

export function CameraView({ onImageReady }: CameraViewProps) {
  const { toast } = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);

  const getCameraPermission = async () => {
    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(newStream);
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  };

  React.useEffect(() => {
    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
         if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };
  
  const handleRetake = () => {
      setCapturedImage(null);
      getCameraPermission();
  }

  const handleConfirm = () => {
      if (capturedImage) {
          onImageReady(capturedImage);
      }
  }

  return (
    <div className="space-y-4">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted">
            {capturedImage ? (
                <img src={capturedImage} alt="Captured" className="h-full w-full object-contain" />
            ) : (
                <>
                    <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                </>
            )}
            
            {!capturedImage && hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                        Please allow camera access to use this feature.
                        <Button onClick={getCameraPermission} className="mt-2">Try Again</Button>
                      </AlertDescription>
                    </Alert>
                </div>
            )}
             {!capturedImage && hasCameraPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                </div>
            )}
        </div>

        {capturedImage ? (
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleRetake}>
                    <RefreshCcw className="mr-2 h-4 w-4"/>
                    Retake
                </Button>
                <Button onClick={handleConfirm}>
                    Use this image
                </Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-2">
                <Button onClick={handleCapture} disabled={!hasCameraPermission}>
                    <Camera className="mr-2 h-4 w-4"/>
                    Take Photo
                </Button>
            </div>
        )}
    </div>
  );
}
