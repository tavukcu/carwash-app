import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface Props {
  totalSeconds: number;
  onComplete: () => void;
  programName: string;
  programIcon: string;
}

export default function CountdownTimer({ totalSeconds, onComplete, programName, programIcon }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100;

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.icon, { transform: [{ scale: pulseAnim }] }]}>
        {programIcon}
      </Animated.Text>
      <Text style={styles.program}>{programName}</Text>
      <Text style={styles.timer}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </Text>
      <View style={styles.progressBg}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.label}>Yıkama devam ediyor...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  program: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  timer: {
    fontSize: 56,
    fontWeight: '700',
    color: '#2563eb',
    fontVariant: ['tabular-nums'],
    marginBottom: 20,
  },
  progressBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  label: {
    fontSize: 16,
    color: '#64748b',
  },
});
