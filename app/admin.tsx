import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, TextInput, RefreshControl,
} from 'react-native';
import {
  DashboardData, Station, Program, Ticket, ReportsResponse,
  getDashboard, getStations, getPrograms, getTickets,
  updateStation, updateProgram, getReports,
} from '../lib/api';
import { playClick } from '../lib/sounds';

type Tab = 'dashboard' | 'stations' | 'programs' | 'tickets' | 'reports';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Panel', icon: '📊' },
  { key: 'stations', label: 'İstasyonlar', icon: '🚿' },
  { key: 'programs', label: 'Programlar', icon: '🧴' },
  { key: 'tickets', label: 'Biletler', icon: '🎫' },
  { key: 'reports', label: 'Raporlar', icon: '📈' },
];

export default function AdminScreen() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  // Stations
  const [stations, setStations] = useState<Station[]>([]);

  // Programs
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingProgram, setEditingProgram] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketFilter, setTicketFilter] = useState<string>('');

  // Reports
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
        case 'programs':
          setPrograms(await getPrograms());
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

  const handleProgramUpdate = async (id: number) => {
    playClick();
    const data: any = {};
    if (editPrice) data.price = Number(editPrice);
    if (editDuration) data.duration = Number(editDuration) * 60; // dk -> sn
    try {
      await updateProgram(id, data);
      setPrograms(await getPrograms());
      setEditingProgram(null);
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  return (
    <View style={styles.container}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Dashboard */}
            {tab === 'dashboard' && dashboard && (
              <View>
                <Text style={styles.heading}>Dashboard</Text>
                <View style={styles.statGrid}>
                  <StatCard icon="💰" label="Bugün Gelir" value={`${dashboard.todayIncome} TL`} color="#16a34a" />
                  <StatCard icon="🎫" label="Bugün Bilet" value={String(dashboard.todayTickets)} color="#2563eb" />
                  <StatCard icon="🚿" label="Aktif İstasyon" value={String(dashboard.activeStations)} color="#f59e0b" />
                  <StatCard icon="⏳" label="Bekleyen Bilet" value={String(dashboard.pendingTickets)} color="#8b5cf6" />
                  <StatCard icon="🔄" label="Toplam Yıkama" value={String(dashboard.totalWashes)} color="#06b6d4" />
                  <StatCard icon="💎" label="Toplam Gelir" value={`${dashboard.totalIncome} TL`} color="#ec4899" />
                </View>
              </View>
            )}

            {/* Stations */}
            {tab === 'stations' && (
              <View>
                <Text style={styles.heading}>İstasyonlar</Text>
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
                        <Text style={styles.smallBtnText}>Boş</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallBtn, { backgroundColor: '#dc2626' }]}
                        onPress={() => handleStationStatus(s.id, 'maintenance')}
                      >
                        <Text style={styles.smallBtnText}>Bakımda</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Programs */}
            {tab === 'programs' && (
              <View>
                <Text style={styles.heading}>Programlar</Text>
                {programs.map((p) => (
                  <View key={p.id} style={styles.listCard}>
                    <View style={styles.listHeader}>
                      <Text style={styles.listTitle}>{p.icon} {p.name}</Text>
                      <Text style={styles.priceTag}>{p.price} TL</Text>
                    </View>
                    <Text style={styles.durationText}>{Math.floor(p.duration / 60)} dk</Text>

                    {editingProgram === p.id ? (
                      <View style={styles.editRow}>
                        <TextInput
                          style={styles.editInput}
                          placeholder="Fiyat (TL)"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          value={editPrice}
                          onChangeText={setEditPrice}
                        />
                        <TextInput
                          style={styles.editInput}
                          placeholder="Sure (dk)"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          value={editDuration}
                          onChangeText={setEditDuration}
                        />
                        <TouchableOpacity
                          style={[styles.smallBtn, { backgroundColor: '#16a34a' }]}
                          onPress={() => handleProgramUpdate(p.id)}
                        >
                          <Text style={styles.smallBtnText}>Kaydet</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.smallBtn, { backgroundColor: '#2563eb', marginTop: 8 }]}
                        onPress={() => {
                          playClick();
                          setEditingProgram(p.id);
                          setEditPrice(String(p.price));
                          setEditDuration(String(Math.floor(p.duration / 60)));
                        }}
                      >
                        <Text style={styles.smallBtnText}>Düzenle</Text>
                      </TouchableOpacity>
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
                    { key: '', label: 'Tümü' },
                    { key: 'pending', label: 'Bekleyen' },
                    { key: 'used', label: 'Kullanıldı' },
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
                  <Text style={styles.emptyText}>Bilet bulunamadı</Text>
                ) : (
                  tickets.map((t) => (
                    <View key={t.id} style={styles.listCard}>
                      <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>#{t.id} {t.icon || '🎫'} {t.program_name || ''}</Text>
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
                    { key: 'daily' as const, label: 'Günlük' },
                    { key: 'weekly' as const, label: 'Haftalık' },
                    { key: 'monthly' as const, label: 'Aylık' },
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

                {/* Income Report */}
                <Text style={styles.sectionTitle}>Gelir Raporu</Text>
                {reports.report.length === 0 ? (
                  <Text style={styles.emptyText}>Veri yok</Text>
                ) : (
                  reports.report.map((r, i) => (
                    <View key={i} style={styles.reportRow}>
                      <Text style={styles.reportDate}>{r.date}</Text>
                      <Text style={styles.reportCount}>{r.wash_count} yıkama</Text>
                      <Text style={styles.reportIncome}>{r.total_income} TL</Text>
                    </View>
                  ))
                )}

                {/* Program Stats */}
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Program İstatistikleri</Text>
                {reports.programStats.map((ps, i) => (
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
  const map: Record<string, { bg: string; text: string; label: string }> = {
    idle: { bg: '#dcfce7', text: '#16a34a', label: 'Boş' },
    active: { bg: '#fef3c7', text: '#f59e0b', label: 'Aktif' },
    maintenance: { bg: '#fee2e2', text: '#dc2626', label: 'Bakımda' },
    pending: { bg: '#fef3c7', text: '#f59e0b', label: 'Bekliyor' },
    used: { bg: '#dcfce7', text: '#16a34a', label: 'Kullanıldı' },
    expired: { bg: '#fee2e2', text: '#dc2626', label: 'Süresi Doldu' },
  };
  const s = map[status] || map.idle;
  return (
    <View style={[badgeStyles.badge, { backgroundColor: s.bg }]}>
      <Text style={[badgeStyles.text, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  text: { fontSize: 12, fontWeight: '600' },
});

const statStyles = StyleSheet.create({
  card: {
    width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderLeftWidth: 4, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  icon: { fontSize: 24, marginBottom: 4 },
  label: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  value: { fontSize: 20, fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  tabBar: {
    maxHeight: 56, backgroundColor: '#fff', borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  tabLabelActive: { color: '#2563eb', fontWeight: '700' },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  listCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  listTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', flex: 1 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  smallBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  smallBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  priceTag: { fontSize: 16, fontWeight: '700', color: '#2563eb' },
  durationText: { fontSize: 13, color: '#64748b' },
  editRow: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' },
  editInput: {
    flex: 1, backgroundColor: '#f8fafc', borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14,
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
  },
  filterActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  emptyText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 20 },
  ticketMeta: { fontSize: 13, color: '#64748b' },
  ticketDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b', marginBottom: 10 },
  reportRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 6,
  },
  reportDate: { fontSize: 13, color: '#1e293b', flex: 1 },
  reportCount: { fontSize: 13, color: '#64748b', marginRight: 12 },
  reportIncome: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
});
