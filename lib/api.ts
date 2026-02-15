const BASE_URL = 'https://carwash-neyisek.vercel.app/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// --- Time Packages ---
export interface TimePackage {
  id: number;
  name: string;
  price: number;
  duration: number; // seconds
  icon: string;
  is_active: number;
}

export function getPackages() {
  return request<TimePackage[]>('/wash/packages');
}

// --- Tickets ---
export interface Ticket {
  id: number;
  qr_code: string;
  package_id: number;
  status: string;
  payment_method: string;
  amount: number;
  station_id: number | null;
  created_at: string;
  used_at: string | null;
  package_name?: string;
  icon?: string;
  station_name?: string;
}

export interface CreateTicketResponse {
  ticket: Ticket;
  package: TimePackage;
  qrDataUrl: string;
}

export function createTicket(package_id: number, payment_method: 'cash' | 'card') {
  return request<CreateTicketResponse>('/tickets', {
    method: 'POST',
    body: JSON.stringify({ package_id, payment_method }),
  });
}

export interface VerifyTicketResponse extends Ticket {
  package_name: string;
  duration: number;
  icon: string;
  package_price: number;
}

export function verifyTicket(qrCode: string) {
  return request<VerifyTicketResponse>(`/tickets/verify/${qrCode}`);
}

export function getTickets(status?: string) {
  const q = status ? `?status=${status}` : '';
  return request<Ticket[]>(`/tickets${q}`);
}

// --- Stations ---
export interface Station {
  id: number;
  name: string;
  status: 'idle' | 'active' | 'maintenance';
  current_ticket_id: number | null;
  package_name?: string;
  start_time?: string | null;
  total_duration?: number | null;
  price?: number | null;
  icon?: string | null;
}

export function getStations() {
  return request<Station[]>('/stations');
}

export function updateStation(id: number, status: string) {
  return request<Station>(`/stations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// --- Wash ---
export interface StartWashResponse {
  message: string;
  ticket_id: number;
  package_name: string;
  duration: number;
  icon: string;
  station_id: number;
}

export function startWash(qr_code: string, station_id: number) {
  return request<StartWashResponse>('/wash/start', {
    method: 'POST',
    body: JSON.stringify({ qr_code, station_id }),
  });
}

export function completeWash(station_id: number) {
  return request<{ message: string; station_id: number }>('/wash/complete', {
    method: 'POST',
    body: JSON.stringify({ station_id }),
  });
}

export function logModeSwitch(ticket_id: number, station_id: number, mode: 'foam' | 'wash', action: 'on' | 'off') {
  return request<{ message: string; mode: string; action: string }>('/wash/mode', {
    method: 'POST',
    body: JSON.stringify({ ticket_id, station_id, mode, action }),
  });
}

// --- Admin ---
export interface DashboardData {
  activeStations: number;
  todayIncome: number;
  todayTickets: number;
  totalIncome: number;
  totalWashes: number;
  pendingTickets: number;
}

export function getDashboard() {
  return request<DashboardData>('/admin/dashboard');
}

export interface ReportRow {
  date: string;
  wash_count: number;
  total_income: number;
}

export interface PackageStat {
  name: string;
  count: number;
  total: number;
}

export interface ReportsResponse {
  report: ReportRow[];
  packageStats: PackageStat[];
}

export function getReports(period: 'daily' | 'weekly' | 'monthly') {
  return request<ReportsResponse>(`/admin/reports?period=${period}`);
}

export function updatePackage(id: number, data: Partial<Pick<TimePackage, 'name' | 'price' | 'duration'>>) {
  return request<TimePackage>(`/admin/packages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function createPackage(data: { name: string; price: number; duration: number; icon?: string }) {
  return request<TimePackage>('/admin/packages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deletePackage(id: number) {
  return request<{ message: string }>(`/admin/packages/${id}`, {
    method: 'DELETE',
  });
}
