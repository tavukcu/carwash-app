import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, TextInput, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import StationGrid from '../components/StationGrid';
import CountdownTimer from '../components/CountdownTimer';
import { Station, getStations, verifyTicket, startWash, completeWash, VerifyTicketResponse } from '../lib/api';
import { playClick, playBeep, playSuccess, playError, playComplete } from '../lib/sounds';

type Screen = 'stations' | 'scan' | 'confirm' | 'washing' | 'done';

export default function KioskScreen() {
  const [screen, setScreen] = useState<Screen>('stations');
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [ticketInfo, setTicketInfo] = useState<VerifyTicketResponse | null>(null);
  const [scannedQR, setScannedQR] = useState('');
  const [manualQR, setManualQR] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scanLock = useRef(false);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const data = await getStations();
      setStations(data);
    } catch {
      Alert.alert('Hata', 'İstasyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleStationSelect = (s: Station) => {
    setSelectedStation(s);
    setScreen('scan');
    scanLock.current = false;
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanLock.current) return;
    scanLock.current = true;
    playBeep();
    await processQR(data);
  };

  const handleManualSubmit = async () => {
    if (!manualQR.trim()) return;
    playClick();
    await processQR(manualQR.trim());
  };

  const processQR = async (qr: string) => {
    setScannedQR(qr);
    setProcessing(true);
    try {
      const info = await verifyTicket(qr);
      setTicketInfo(info);
      setScreen('confirm');
      playSuccess();
    } catch (e: any) {
      playError();
      Alert.alert('Geçersiz Bilet', e.message || 'QR kod doğrulanamadı');
      scanLock.current = false;
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedStation || !scannedQR) return;
    playClick();
    setProcessing(true);
    try {
      await startWash(scannedQR, selectedStation.id);
      setScreen('washing');
      playSuccess();
    } catch (e: any) {
      playError();
      Alert.alert('Hata', e.message || 'Yıkama başlatılamadı');
    } finally {
      setProcessing(false);
    }
  };

  const handleWashComplete = async () => {
    if (!selectedStation) return;
    try {
      await completeWash(selectedStation.id);
      playComplete();
    } catch {}
    setScreen('done');
    setTimeout(reset, 5000);
  };

  const reset = () => {
    setScreen('stations');
    setSelectedStation(null);
    setTicketInfo(null);
    setScannedQR('');
    setManualQR('');
    scanLock.current = false;
    loadStations();
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Station Selection */}
      {screen === 'stations' && (
        <View>
          <Text style={styles.heading}>İstasyon Seçin</Text>
          <StationGrid stations={stations} selectedId={null} onSelect={handleStationSelect} />
        </View>
      )}

      {/* QR Scan */}
      {screen === 'scan' && (
        <View>
          <Text style={styles.heading}>QR Kod Okutun</Text>
          <Text style={styles.subtext}>{selectedStation?.name} seçildi</Text>

          {Platform.OS !== 'web' ? (
            permission?.granted ? (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={handleBarCodeScanned}
                />
                {processing && (
                  <View style={styles.cameraOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.overlayText}>Doğrulanıyor...</Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                <Text style={styles.permText}>Kamera İzni Ver</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.webCameraNotice}>
              <Text style={styles.webCameraIcon}>📷</Text>
              <Text style={styles.webCameraText}>Web tarayıcıda kamera kullanılamaz.{'\n'}QR kodunu aşağıya manuel girin.</Text>
            </View>
          )}

          <Text style={styles.orText}>{Platform.OS !== 'web' ? 'veya manuel girin' : 'QR kodunu girin'}</Text>
          <View style={styles.manualRow}>
            <TextInput
              style={styles.input}
              value={manualQR}
              onChangeText={setManualQR}
              placeholder="QR kodu yazın..."
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit}>
              <Text style={styles.submitText}>Doğrula</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => { playClick(); setScreen('stations'); }}>
            <Text style={styles.backText}>← İstasyon Seçimi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirmation */}
      {screen === 'confirm' && ticketInfo && (
        <View style={styles.confirmContainer}>
          <Text style={styles.heading}>Yıkama Onay</Text>

          <View style={styles.confirmCard}>
            <Text style={styles.confirmIcon}>{ticketInfo.icon}</Text>
            <Text style={styles.confirmProgram}>{ticketInfo.program_name}</Text>
            <Text style={styles.confirmPrice}>{ticketInfo.program_price} TL</Text>
            <Text style={styles.confirmDuration}>Süre: {Math.floor(ticketInfo.duration / 60)} dk</Text>
            <Text style={styles.confirmStation}>📍 {selectedStation?.name}</Text>
          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleConfirm}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.startText}>Yıkamaya Başla</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => { playClick(); setScreen('scan'); scanLock.current = false; }}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Washing countdown */}
      {screen === 'washing' && ticketInfo && (
        <CountdownTimer
          totalSeconds={ticketInfo.duration}
          onComplete={handleWashComplete}
          programName={ticketInfo.program_name}
          programIcon={ticketInfo.icon}
        />
      )}

      {/* Done */}
      {screen === 'done' && (
        <View style={styles.doneContainer}>
          <Text style={styles.doneIcon}>✅</Text>
          <Text style={styles.doneText}>Yıkama Tamamlandı!</Text>
          <Text style={styles.doneHint}>Aracınızı alabilirsiniz</Text>
          <Text style={styles.autoReset}>5 saniye içinde sıfırlanacak...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  subtext: { fontSize: 14, color: '#64748b', marginBottom: 16 },
  cameraContainer: {
    height: 300, borderRadius: 16, overflow: 'hidden',
    marginBottom: 16, position: 'relative',
  },
  camera: { flex: 1 },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
  },
  overlayText: { color: '#fff', fontSize: 16, marginTop: 8 },
  permBtn: {
    backgroundColor: '#2563eb', padding: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 16,
  },
  permText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  webCameraNotice: {
    backgroundColor: '#fff7ed', borderRadius: 16, padding: 24, alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: '#fed7aa',
  },
  webCameraIcon: { fontSize: 36, marginBottom: 8 },
  webCameraText: { fontSize: 14, color: '#9a3412', textAlign: 'center', lineHeight: 20 },
  orText: { textAlign: 'center', color: '#94a3b8', marginVertical: 12 },
  manualRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 16, borderWidth: 1, borderColor: '#e2e8f0',
  },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  submitText: { color: '#fff', fontWeight: '600' },
  backBtn: { marginTop: 12, alignSelf: 'center' },
  backText: { fontSize: 15, color: '#64748b' },
  confirmContainer: { alignItems: 'center' },
  confirmCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center',
    width: '100%', marginVertical: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  confirmIcon: { fontSize: 48, marginBottom: 12 },
  confirmProgram: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  confirmPrice: { fontSize: 24, fontWeight: '700', color: '#2563eb', marginBottom: 4 },
  confirmDuration: { fontSize: 15, color: '#64748b', marginBottom: 8 },
  confirmStation: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  startBtn: {
    backgroundColor: '#16a34a', paddingHorizontal: 40, paddingVertical: 16,
    borderRadius: 14, width: '100%', alignItems: 'center',
  },
  startText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  doneContainer: { alignItems: 'center', paddingTop: 40 },
  doneIcon: { fontSize: 64, marginBottom: 16 },
  doneText: { fontSize: 26, fontWeight: '700', color: '#16a34a', marginBottom: 8 },
  doneHint: { fontSize: 18, color: '#64748b', marginBottom: 24 },
  autoReset: { fontSize: 13, color: '#94a3b8' },
});
