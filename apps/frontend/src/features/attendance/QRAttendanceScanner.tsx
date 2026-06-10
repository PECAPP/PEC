import { Button, Card, useToast } from "@pec/ui";
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@pec/api';

interface QRAttendanceScannerProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function QRAttendanceScanner({ onSuccess, onClose }: QRAttendanceScannerProps) {
  const { toast: uiToast } = useToast();
  const { user } = usePermissions();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');
  const scannerRef = useRef<any | null>(null);
  const qrCodeRegionId = 'qr-reader';

  const startScanning = async () => {
    try {
      setScanning(true);
      setResult(null);

      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      uiToast({
        title: 'Camera Error',
        description: 'Failed to access camera. Please check permissions.',
        variant: 'destructive',
      });
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    if (processing) return;

    setProcessing(true);
    await stopScanning();

    try {
      if (!user) {
        setResult('error');
        setMessage('User not authenticated');
        return;
      }

      const parts = decodedText.split(':');
      const uniqueId = parts[0];
      const qrTimestamp = parts.length > 1 ? parseInt(parts[1]) : 0;
      
      const now = Date.now();
      if (qrTimestamp && (now - qrTimestamp > 20000)) { 
         setResult('error');
         setMessage('QR Code has expired. Please scan the new one.');
         toast('Expired QR', {
           description: 'This code is too old. Scan the fresh one on screen!'
         });
         return;
      }

      let location: { lat?: number; lng?: number } = {};
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch (err) {
        console.warn('Geolocation failed or denied:', err);
      }

      await api.post('/attendance/mark-qr', { qrCode: uniqueId, lat: location.lat, lng: location.lng });

      setResult('success');
      setMessage(`Attendance marked!`);
      toast('Success!', {
        description: `Attendance marked successfully`,
      });

      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setResult('error');
      setMessage('Failed to mark attendance');
      toast('Error', {
        description: 'Failed to mark attendance. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  const onScanFailure = (_error: any) => {
    // Ignore scan failures
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Scan QR Code</h3>
        <p className="text-sm text-muted-foreground">
          Point your camera at the QR code displayed by your instructor
        </p>
      </div>

      {!scanning && !result && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-64 h-64 bg-muted rounded-sm flex items-center justify-center">
            <Camera className="w-16 h-16 text-muted-foreground" />
          </div>
          <Button onClick={startScanning} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
        </div>
      )}

      {scanning && (
        <div className="space-y-4">
          <div id={qrCodeRegionId} className="rounded-sm overflow-hidden" />
          {processing && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          )}
          <Button variant="outline" onClick={stopScanning} className="w-full">
            Cancel
          </Button>
        </div>
      )}

      {result && (
        <Card className={`p-6 ${result === 'success' ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
          <div className="flex flex-col items-center gap-4">
            {result === 'success' ? (
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
            )}
            <div className="text-center">
              <h4 className={`text-lg font-semibold mb-1 ${result === 'success' ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                {result === 'success' ? 'Success!' : 'Error'}
              </h4>
              <p className={`text-sm ${result === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {message}
              </p>
            </div>
            <div className="flex gap-3 w-full">
              {result === 'error' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    startScanning();
                  }}
                  className="flex-1"
                >
                  Try Again
                </Button>
              )}
              {onClose && (
                <Button
                  variant={result === 'success' ? 'default' : 'outline'}
                  onClick={onClose}
                  className="flex-1"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default QRAttendanceScanner;

