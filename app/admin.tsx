import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, TextInput, RefreshControl, Platform,
} from 'react-native';
import {
  DashboardData, Station, TimePackage, Ticket, ReportsResponse,
  getDashboard, getStations, getPackages, getTickets,
  updateStation, updatePackage, createPackage, deletePackage, getReports,
} from '../lib/api';
import { playClick } from '../lib/sounds';
import { K } from '../lib/theme';

type Tab = 'dashboard' | 'stations' | 'packages' | 'tickets' | 'reports';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Panel', icon: '📊' },
  { key: 'stations', label: 'Istasyonlar', icon: '🚿' },
  { key: 'packages', label: 'Paketler', icon: '⏱️' },
  { key: 'tickets', label: 'Biletler', icon: '🎫' },
  { key: 'reports', label: 'Raporlar', icon: '📈' },
];

export default function AdminScreen() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [packages, setPackages] = useState<TimePackage[]>([]);
  const [editingPackage, setEditingPackage] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketFilter, setTicketFilter] = useState<string>('');
  const [reports, setReports] = useState<ReportsResponse | null>(null);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);

  const loadTab = useCallback(async () => {
    setLoading(true);
    try {
      switch (tab) {
        case 'dashboard':
          setDashboard(await getDashboard());
          break;
        case 'stations':
          setStations(await getStations());
          break;
        case 'packages':
          setPackages(await getPackages());
          break;
        case 'tickets':
          setTickets(await getTickets(ticketFilter || undefined));
          break;
        case 'reports':
          setReports(await getReports(reportPeriod));
          break;
      }
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    } finally {
      setLoading(false);
    }
  }, [tab, ticketFilter, reportPeriod]);

  useEffect(() => {
    loadTab();
  }, [loadTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTab();
    setRefreshing(false);
  }, [loadTab]);

  const handleStationStatus = async (id: number, status: string) => {
    playClick();
    try {
      await updateStation(id, status);
      setStations(await getStations());
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handlePackageUpdate = async (id: number) => {
    playClick();
    const data: any = {};
    if (editName) data.name = editName;
    if (editPrice) data.price = Number(editPrice);
    if (editDuration) data.duration = Number(editDuration) * 60;
    try {
      await updatePackage(id, data);
      setPackages(await getPackages());
      setEditingPackage(null);
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handleCreatePackage = async () => {
    if (!newName || !newPrice || !newDuration) {
      Alert.alert('Hata', 'Tum alanlari doldurun');
      return;
    }
    playClick();
    try {
      await createPackage({
        name: newName,
        price: Number(newPrice),
        duration: Number(newDuration) * 60,
      });
      setPackages(await getPackages());
      setShowNewForm(false);
      setNewName('');
      setNewPrice('');
      setNewDuration('');
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handleDeletePackage = (id: number, name: string) => {
    Alert.alert(
      'Paket Sil',
      `"${name}" paketini silmek istediginize emin misiniz?`,
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            playClick();
            try {
              await deletePackage(id);
              setPackages(await getPackages());
            } catch (e: any) {
              Alert.alert('Hata', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderIcon}>⚙️</Text>
        <View>
          <Text style={styles.pageHeaderTitle}>Yonetim Paneli</Text>
          <Text style={styles.pageHeaderSub}>Admin</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => { playClick(); setTab(t.key); }}
          >
            <Text style={styles.tabIcon}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={K.accent} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={K.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Dashboard */}
            {tab === 'dashboard' && dashboard && (
              <View>
                <Text style={styles.heading}>Dashboard</Text>
                <View style={styles.statGrid}>
                  <StatCard icon="💰" label="Bugun Gelir" value={`${dashboard.todayIncome} TL`} color={K.green} />
                  <StatCard icon="🎫" label="Bugun Bilet" value={String(dashboard.todayTickets)} color={K.accent} />
                  <StatCard icon="🚿" label="Aktif Istasyon" value={String(dashboard.activeStations)} color={K.yellow} />
                  <StatCard icon="⏳" label="Bekleyen Bilet" value={String(dashboard.pendingTickets)} color={K.purple} />
                  <StatCard icon="🔄" label="Toplam Yikama" value={String(dashboard.totalWashes)} color={K.accent} />
                  <StatCard icon="💎" label="Toplam Gelir" value={`${dashboard.totalIncome} TL`} color="#ff6b9d" />
                </View>
              </View>
            )}

            {/* Stations */}
            {tab === 'stations' && (
              <View>
                <Text style={styles.heading}>Istasyonlar</Text>
                {stations.map((s) => (
                  <View key={s.id} style={styles.listCard}>
                    <View style={styles.listHeader}>
                      <Text style={styles.listTitle}>🚿 {s.name}</Text>
                      <StatusBadge status={s.status} />
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.smallBtn, { backgroundColor: '#16a34a' }]}
                        onPress={() => handleStationStatus(s.id, 'idle')}
                      >
                        <Text style={styles.smallBtnText}>Bos</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallBtn, { backgroundColor: '#dc2626' }]}
                        onPress={() => handleStationStatus(s.id, 'maintenance')}
                      >
                        <Text style={styles.smallBtnText}>Bakimda</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Packages */}
            {tab === 'packages' && (
              <View>
                <View style={styles.headingRow}>
                  <Text style={styles.heading}>Paketler</Text>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: '#16a34a' }]}
                    onPress={() => { playClick(); setShowNewForm(!showNewForm); }}
                  >
                    <Text style={styles.smallBtnText}>{showNewForm ? 'Iptal' : '+ Paket Ekle'}</Text>
                  </TouchableOpacity>
                </View>

                {showNewForm && (
                  <View style={styles.newFormCard}>
                    <TextInput
                      style={styles.editInput}
                      placeholder="Paket adi (or: 25 Dakika)"
                      placeholderTextColor={K.textMuted}
                      value={newName}
                      onChangeText={setNewName}
                    />
                    <View style={styles.editRow}>
                      <TextInput
                        style={styles.editInput}
                        placeholder="Fiyat (TL)"
                        placeholderTextColor={K.textMuted}
                        keyboardType="numeric"
                        value={newPrice}
                        onChangeText={setNewPrice}
                      />
                      <TextInput
                        style={styles.editInput}
                        placeholder="Sure (dk)"
                        placeholderTextColor={K.textMuted}
                        keyboardType="numeric"
                        value={newDuration}
                        onChangeText={setNewDuration}
                      />
                    </View>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: '#0d7a3e', alignSelf: 'flex-end', marginTop: 10 }]}
                      onPress={handleCreatePackage}
                    >
                      <Text style={styles.smallBtnText}>Olustur</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {packages.map((p) => (
                  <View key={p.id} style={styles.listCard}>
                    <View style={styles.listHeader}>
                      <Text style={styles.listTitle}>{p.icon} {p.name}</Text>
                      <Text style={styles.priceTag}>{p.price} TL</Text>
                    </View>
                    <Text style={styles.durationText}>{Math.floor(p.duration / 60)} dk</Text>

                    {editingPackage === p.id ? (
                      <View>
                        <View style={styles.editRow}>
                          <TextInput
                            style={styles.editInput}
                            placeholder="Ad"
                            placeholderTextColor={K.textMuted}
                            value={editName}
                            onChangeText={setEditName}
                          />
                        </View>
                        <View style={styles.editRow}>
                          <TextInput
                            style={styles.editInput}
                            placeholder="Fiyat (TL)"
                            placeholderTextColor={K.textMuted}
                            keyboardType="numeric"
                            value={editPrice}
                            onChangeText={setEditPrice}
                          />
                          <TextInput
                            style={styles.editInput}
                            placeholder="Sure (dk)"
                            placeholderTextColor={K.textMuted}
                            keyboardType="numeric"
                            value={editDuration}
                            onChangeText={setEditDuration}
                          />
                          <TouchableOpacity
                            style={[styles.smallBtn, { backgroundColor: '#16a34a' }]}
                            onPress={() => handlePackageUpdate(p.id)}
                          >
                            <Text style={styles.smallBtnText}>Kaydet</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.smallBtn, { backgroundColor: K.accentDark }]}
                          onPress={() => {
                            playClick();
                            setEditingPackage(p.id);
                            setEditName(p.name);
                            setEditPrice(String(p.price));
                            setEditDuration(String(Math.floor(p.duration / 60)));
                          }}
                        >
                          <Text style={styles.smallBtnText}>Duzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallBtn, { backgroundColor: '#dc2626' }]}
                          onPress={() => handleDeletePackage(p.id, p.name)}
                        >
                          <Text style={styles.smallBtnText}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Tickets */}
            {tab === 'tickets' && (
              <View>
                <Text style={styles.heading}>Biletler</Text>
                <View style={styles.filterRow}>
                  {[
                    { key: '', label: 'Tumu' },
                    { key: 'pending', label: 'Bekleyen' },
                    { key: 'used', label: 'Kullanildi' },
                  ].map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      style={[styles.filterBtn, ticketFilter === f.key && styles.filterActive]}
                      onPress={() => { playClick(); setTicketFilter(f.key); }}
                    >
                      <Text style={[styles.filterText, ticketFilter === f.key && styles.filterTextActive]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {tickets.length === 0 ? (
                  <Text style={styles.emptyText}>Bilet bulunamadi</Text>
                ) : (
                  tickets.map((t) => (
                    <View key={t.id} style={styles.listCard}>
                      <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>#{t.id} {t.icon || '🎫'} {t.package_name || ''}</Text>
                        <StatusBadge status={t.status} />
                      </View>
                      <Text style={styles.ticketMeta}>
                        {t.amount} TL • {t.payment_method === 'cash' ? 'Nakit' : 'Kart'}
                        {t.station_name ? ` • ${t.station_name}` : ''}
                      </Text>
                      <Text style={styles.ticketDate}>
                        {new Date(t.created_at).toLocaleString('tr-TR')}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Reports */}
            {tab === 'reports' && reports && (
              <View>
                <Text style={styles.heading}>Raporlar</Text>
                <View style={styles.filterRow}>
                  {[
                    { key: 'daily' as const, label: 'Gunluk' },
                    { key: 'weekly' as const, label: 'Haftalik' },
                    { key: 'monthly' as const, label: 'Aylik' },
                  ].map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      style={[styles.filterBtn, reportPeriod === f.key && styles.filterActive]}
                      onPress={() => { playClick(); setReportPeriod(f.key); }}
                    >
                      <Text style={[styles.filterText, reportPeriod === f.key && styles.filterTextActive]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Gelir Raporu</Text>
                {reports.report.length === 0 ? (
                  <Text style={styles.emptyText}>Veri yok</Text>
                ) : (
                  reports.report.map((r, i) => (
                    <View key={i} style={styles.reportRow}>
                      <Text style={styles.reportDate}>{r.date}</Text>
                      <Text style={styles.reportCount}>{r.wash_count} yikama</Text>
                      <Text style={styles.reportIncome}>{r.total_income} TL</Text>
                    </View>
                  ))
                )}

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Paket Istatistikleri</Text>
                {reports.packageStats.map((ps, i) => (
                  <View key={i} style={styles.reportRow}>
                    <Text style={styles.reportDate}>{ps.name}</Text>
                    <Text style={styles.reportCount}>{ps.count} adet</Text>
                    <Text style={styles.reportIncome}>{ps.total} TL</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={[statStyles.card, { borderLeftColor: color }]}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; border: string; text: string; label: string }> = {
    idle: { bg: K.greenBg, border: K.greenBorder, text: K.green, label: 'Bos' },
    active: { bg: K.yellowBg, border: K.yellowBorder, text: K.yellow, label: 'Aktif' },
    maintenance: { bg: K.redBg, border: K.redBorder, text: K.red, label: 'Bakimda' },
    pending: { bg: K.yellowBg, border: K.yellowBorder, text: K.yellow, label: 'Bekliyor' },
    used: { bg: K.greenBg, border: K.greenBorder, text: K.green, label: 'Kullanildi' },
    expired: { bg: K.redBg, border: K.redBorder, text: K.red, label: 'Suresi Doldu' },
  };
  const s = map[status] || map.idle;
  return (
    <View style={[badgeStyles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[badgeStyles.text, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  text: { fontSize: K.fontXs, fontWeight: '700' },
});

const statStyles = StyleSheet.create({
  card: {
    width: '47%', backgroundColor: K.bgCard, borderRadius: K.radiusSm, padding: 16,
    borderLeftWidth: 4, marginBottom: 14,
    borderWidth: 1, borderColor: K.border,
  },
  icon: { fontSize: 28, marginBottom: 6 },
  label: { fontSize: K.fontXs, color: K.textSecondary, marginBottom: 4 },
  value: { fontSize: K.fontLg, fontWeight: '800' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: K.bg },
  pageHeader: {
    backgroundColor: K.bgHeader,
    paddingTop: Platform.OS === 'web' ? 20 : 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: K.accentBorder,
  },
  pageHeaderIcon: { fontSize: K.iconSize },
  pageHeaderTitle: { fontSize: K.fontXl, fontWeight: '800', color: '#ffffff' },
  pageHeaderSub: { fontSize: K.fontSm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  tabBar: {
    maxHeight: 60, backgroundColor: K.bgCard, borderBottomWidth: 1,
    borderBottomColor: K.border,
  },
  tab: {
    paddingHorizontal: 22, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  tabActive: { borderBottomWidth: 3, borderBottomColor: K.accent },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: K.fontSm, color: K.textMuted, fontWeight: '600' },
  tabLabelActive: { color: K.accent, fontWeight: '800' },
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: K.fontXl, fontWeight: '800', color: K.text, marginBottom: 20 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  listCard: {
    backgroundColor: K.bgCard, borderRadius: K.radiusSm, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: K.border,
  },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  listTitle: { fontSize: K.fontMd, fontWeight: '700', color: K.text, flex: 1 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  smallBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 12, minHeight: 52 },
  smallBtnText: { color: '#fff', fontSize: K.fontSm, fontWeight: '700' },
  priceTag: { fontSize: K.fontMd, fontWeight: '800', color: K.accent },
  durationText: { fontSize: K.fontSm, color: K.textSecondary },
  editRow: { flexDirection: 'row', gap: 10, marginTop: 12, alignItems: 'center' },
  editInput: {
    flex: 1, backgroundColor: K.bgInput, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: K.border, fontSize: K.fontSm, color: K.text,
  },
  newFormCard: {
    backgroundColor: K.bgCard, borderRadius: K.radiusSm, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: K.border,
  },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  filterBtn: {
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22,
    backgroundColor: K.bgCard, borderWidth: 1, borderColor: K.border,
  },
  filterActive: { backgroundColor: K.accent, borderColor: K.accent },
  filterText: { fontSize: K.fontSm, color: K.textMuted, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  emptyText: { fontSize: K.fontSm, color: K.textMuted, textAlign: 'center', marginTop: 24 },
  ticketMeta: { fontSize: K.fontSm, color: K.textSecondary },
  ticketDate: { fontSize: K.fontXs, color: K.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: K.fontLg, fontWeight: '700', color: K.text, marginBottom: 12 },
  reportRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: K.bgCard, borderRadius: 10, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: K.border,
  },
  reportDate: { fontSize: K.fontSm, color: K.text, flex: 1 },
  reportCount: { fontSize: K.fontSm, color: K.textSecondary, marginRight: 14 },
  reportIncome: { fontSize: K.fontMd, fontWeight: '800', color: K.accent },
});
