import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import jsQR from 'jsqr';
import { K } from '../lib/theme';

interface Props {
  onScan: (data: string) => void;
  processing?: boolean;
}

export default function WebQRScanner({ onScan, processing }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setStarted(true);
          scanLoop();
        }
      } catch (e: any) {
        setError('Kamera erisimi reddedildi veya desteklenmiyor.');
      }
    };

    const scanLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const tick = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            onScan(code.data);
            return;
          }
        }
        animFrameRef.current = requestAnimationFrame(tick);
      };

      animFrameRef.current = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* @ts-ignore - web-only elements */}
      <video
        ref={videoRef as any}
        style={{
          width: '100%',
          height: 320,
          objectFit: 'cover',
          borderRadius: 20,
          backgroundColor: '#000',
        }}
        playsInline
        muted
      />
      {/* @ts-ignore */}
      <canvas ref={canvasRef as any} style={{ display: 'none' }} />
      {!started && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={K.accent} />
          <Text style={styles.loadingText}>Kamera aciliyor...</Text>
        </View>
      )}
      {processing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={K.accent} />
          <Text style={styles.loadingText}>Dogrulaniyor...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    borderRadius: K.radius,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: K.accentBorder,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: K.accent,
    fontSize: K.fontMd,
    marginTop: 10,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: K.redBg,
    borderRadius: K.radius,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: K.redBorder,
  },
  errorIcon: {
    fontSize: K.iconSize,
    marginBottom: 10,
  },
  errorText: {
    fontSize: K.fontSm,
    color: K.red,
    textAlign: 'center',
    lineHeight: 22,
  },
});
