import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useCountdown } from '../lib/useCountdown';
import { playClick } from '../lib/sounds';

type WashMode = 'foam' | 'wash';

interface Props {
  totalSeconds: number;
  onModeSwitch: (mode: WashMode) => void;
  onComplete: () => void;
  packageName: string;
}

export default function WashModeSelector({ totalSeconds, onModeSwitch, onComplete, packageName }: Props) {
  const [activeMode, setActiveMode] = useState<WashMode>('foam');
  const { remaining, progress, formatted, isComplete } = useCountdown(totalSeconds);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete]);

  const handleModeSwitch = (mode: WashMode) => {
    if (mode === activeMode) return;
    playClick();
    setActiveMode(mode);
    onModeSwitch(mode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.packageName}>{packageName}</Text>

      {/* Timer */}
      <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.timer}>{formatted}</Text>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.remainingText}>
        {Math.floor(remaining / 60)} dk {remaining % 60} sn kaldı
      </Text>

      {/* Mode buttons */}
      <Text style={styles.modeLabel}>Yıkama Modu</Text>
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, styles.foamBtn, activeMode === 'foam' && styles.foamBtnActive]}
          onPress={() => handleModeSwitch('foam')}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>🧼</Text>
          <Text style={[styles.modeText, activeMode === 'foam' && styles.modeTextActive]}>Köpük</Text>
          {activeMode === 'foam' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, styles.washBtn, activeMode === 'wash' && styles.washBtnActive]}
          onPress={() => handleModeSwitch('wash')}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>🚿</Text>
          <Text style={[styles.modeText, activeMode === 'wash' && styles.modeTextActive]}>Yıkama</Text>
          {activeMode === 'wash' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Modlar arasında serbestçe geçiş yapabilirsiniz</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 16,
  },
  timerContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 20,
    marginBottom: 20,
  },
  timer: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  progressBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 28,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
  },
  foamBtn: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
  },
  foamBtnActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  washBtn: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
  },
  washBtnActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  modeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  modeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
  },
  modeTextActive: {
    color: '#1e293b',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    marginTop: 8,
  },
  hint: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
