import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useCountdown } from '../lib/useCountdown';
import { playClick } from '../lib/sounds';
import { K } from '../lib/theme';

interface Props {
  totalSeconds: number;
  onModeSwitch: (mode: 'foam' | 'wash', action: 'on' | 'off') => void;
  onComplete: () => void;
  packageName: string;
}

export default function WashModeSelector({ totalSeconds, onModeSwitch, onComplete, packageName }: Props) {
  const [foamOn, setFoamOn] = useState(false);
  const [washOn, setWashOn] = useState(false);
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

  const toggle = (mode: 'foam' | 'wash') => {
    playClick();
    if (mode === 'foam') {
      const next = !foamOn;
      setFoamOn(next);
      onModeSwitch('foam', next ? 'on' : 'off');
    } else {
      const next = !washOn;
      setWashOn(next);
      onModeSwitch('wash', next ? 'on' : 'off');
    }
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
        {Math.floor(remaining / 60)} dk {remaining % 60} sn kaldi
      </Text>

      {/* Control buttons */}
      <Text style={styles.modeLabel}>Kontroller</Text>

      {/* Foam row */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, foamOn ? styles.onBtnActive : styles.offState]}
          onPress={() => { if (!foamOn) toggle('foam'); }}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>🧼</Text>
          <Text style={[styles.modeText, foamOn && styles.onTextActive]}>Kopuk Ac</Text>
          {foamOn && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, !foamOn ? styles.offBtnActive : styles.offState]}
          onPress={() => { if (foamOn) toggle('foam'); }}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>🧼</Text>
          <Text style={[styles.modeText, !foamOn && styles.offTextActive]}>Kopuk Kapat</Text>
          {!foamOn && <View style={styles.inactiveIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Wash row */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, washOn ? styles.onBtnActive : styles.offState]}
          onPress={() => { if (!washOn) toggle('wash'); }}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>🚿</Text>
          <Text style={[styles.modeText, washOn && styles.onTextActive]}>Yikama Ac</Text>
          {washOn && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeBtn, !washOn ? styles.offBtnActive : styles.offState]}
          onPress={() => { if (washOn) toggle('wash'); }}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>🚿</Text>
          <Text style={[styles.modeText, !washOn && styles.offTextActive]}>Yikama Kapat</Text>
          {!washOn && <View style={styles.inactiveIndicator} />}
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Kopuk ve yikama bagımsiz olarak acilip kapatilabilir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  packageName: {
    fontSize: K.fontLg,
    fontWeight: '700',
    color: K.accent,
    marginBottom: 20,
  },
  timerContainer: {
    backgroundColor: K.bgCard,
    borderRadius: K.radius,
    paddingHorizontal: 48,
    paddingVertical: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: K.accentBorder,
  },
  timer: {
    fontSize: 64,
    fontWeight: '800',
    color: K.text,
    fontVariant: ['tabular-nums'],
  },
  progressBg: {
    width: '100%',
    height: 12,
    backgroundColor: K.bgCard,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: K.accent,
    borderRadius: 6,
  },
  remainingText: {
    fontSize: K.fontSm,
    color: K.textSecondary,
    marginBottom: 32,
  },
  modeLabel: {
    fontSize: K.fontLg,
    fontWeight: '700',
    color: K.text,
    marginBottom: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    borderRadius: K.radius,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    minHeight: 110,
    justifyContent: 'center',
  },
  offState: {
    backgroundColor: K.bgCard,
    borderColor: K.border,
  },
  onBtnActive: {
    backgroundColor: K.greenBg,
    borderColor: K.green,
  },
  offBtnActive: {
    backgroundColor: K.redBg,
    borderColor: K.red,
  },
  modeIcon: {
    fontSize: K.iconSize,
    marginBottom: 8,
  },
  modeText: {
    fontSize: K.fontMd,
    fontWeight: '800',
    color: K.textMuted,
  },
  onTextActive: {
    color: K.green,
  },
  offTextActive: {
    color: K.red,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: K.green,
    marginTop: 8,
  },
  inactiveIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: K.red,
    marginTop: 8,
  },
  hint: {
    fontSize: K.fontSm,
    color: K.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
