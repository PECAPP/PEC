import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, serverTimestamp } from '@/lib/dataClient';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { QrCode, Users, Clock, X, RefreshCw, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface QRAttendanceGeneratorProps {
  courseId: string;
  courseName: string;
  onClose?: () => void;
}

export function QRAttendanceGenerator({ courseId, courseName, onClose }: QRAttendanceGeneratorProps) {
  const { toast } = useToast();
  const { user } = usePermissions();
  const [sessionId, setSessionId] = useState<string>('');
  const [qrValue, setQrValue] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [refreshProgress, setRefreshProgress] = useState(100);
  const ROTATION_INTERVAL = 10000; // 10 seconds

  const generateSession = async (duration: number = 60) => {
    try {
      if (!user) return;

      const now = new Date();
      const expiry = new Date(now.getTime() + duration * 60000); // duration in minutes

      // Create unique session ID
      const uniqueId = `${courseId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create attendance session in backend
      const sessionRef = await addDoc(collection(({} as any), 'attendanceSessions'), {
        facultyId: user.uid,
        courseId,
        courseName,
        date: now.toISOString().split('T')[0],
        startTime: now.toTimeString().split(' ')[0],
        qrCode: uniqueId,
        active: true,
        createdAt: serverTimestamp(),
        expiresAt: expiry.toISOString(),
        attendanceCount: 0,
      });

      setSessionId(sessionRef.id);
      // Initial QR with timestamp
      setQrValue(`${uniqueId}:${Date.now()}`);
      setIsActive(true);
      setExpiresAt(expiry);
      setAttendanceCount(0);
      setRefreshProgress(100);

      toast({
        title: 'QR Code Generated',
        description: `Session active for ${duration} minutes`,
      });
    } catch (error) {
      console.error('Error generating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  const endSession = async () => {
    try {
      if (sessionId) {
        await updateDoc(doc(({} as any), 'attendanceSessions', sessionId), {
          active: false,
          endedAt: serverTimestamp(),
        });
        setIsActive(false);
        toast({
          title: 'Session Ended',
          description: `${attendanceCount} students marked present`,
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive',
      });
    }
  };

  // Update attendance count in real-time
  useEffect(() => {
    if (!sessionId) return;

    const fetchAttendanceCount = async () => {
      const q = query(
        collection(({} as any), 'attendance'),
        where('sessionId', '==', sessionId)
      );
      const snapshot = await getDocs(q);
      setAttendanceCount(snapshot.size);
    };

    // Fetch initially
    fetchAttendanceCount();

    // Poll every 5 seconds
    const interval = setInterval(fetchAttendanceCount, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  // Update time remaining
  useEffect(() => {
    if (!expiresAt || !isActive) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        endSession();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isActive]);

  // Rotating QR Code Logic
  useEffect(() => {
    if (!isActive || !sessionId) return;
    
    const startTime = Date.now();
    let frameId: number;

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) % ROTATION_INTERVAL;
      const progress = 100 - (elapsed / ROTATION_INTERVAL) * 100;
      setRefreshProgress(progress);
      
      // Update QR every 10s (approx check)
      // Actually, we should just derive the QR from Math.floor(now / 10000)
      // But preserving the original uniqueId is key.
      // Let's just update the QR value when progress loops? 
      // Simpler: Just set interval for QR update and use rAF for smooth progress.
      
      frameId = requestAnimationFrame(animate);
    };
    
    const qrInterval = setInterval(() => {
        // Regenerate QR payload with new timestamp
        const baseId = qrValue.split(':')[0];
        setQrValue(`${baseId}:${Date.now()}`);
        setRefreshProgress(100); // Reset visual bar
    }, ROTATION_INTERVAL);

    frameId = requestAnimationFrame(animate);

    return () => {
        clearInterval(qrInterval);
        cancelAnimationFrame(frameId);
    };
  }, [isActive, sessionId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{courseName}</h3>
          <p className="text-sm text-muted-foreground">QR Attendance</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {!isActive ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Generate a QR code for students to mark their attendance
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Button onClick={() => generateSession(30)} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              30 min
            </Button>
            <Button onClick={() => generateSession(60)} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              60 min
            </Button>
            <Button onClick={() => generateSession(90)} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              90 min
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* QR Code Display */}
          <Card className="p-8 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
            <QRCodeSVG
              value={qrValue}
              size={256}
              level="H"
              includeMargin
              className="mb-4"
            />
            <div className="w-full max-w-[256px] space-y-2">
                <Progress value={refreshProgress} className="h-2 w-full transition-all" />
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Auto-refreshing for security
                </p>
            </div>
          </Card>

          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{attendanceCount}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Time Left</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{timeRemaining}</p>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => generateSession(60)}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button
              variant="destructive"
              onClick={endSession}
              className="flex-1"
            >
              End Session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRAttendanceGenerator;
