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

// --- Programs ---
export interface Program {
  id: number;
  name: string;
  price: number;
  duration: number; // seconds
  icon: string;
}

export function getPrograms() {
  return request<Program[]>('/wash/programs');
}

// --- Tickets ---
export interface Ticket {
  id: number;
  qr_code: string;
  program_id: number;
  status: string;
  payment_method: string;
  amount: number;
  station_id: number | null;
  created_at: string;
  used_at: string | null;
  program_name?: string;
  icon?: string;
  station_name?: string;
}

export interface CreateTicketResponse {
  ticket: Ticket;
  program: Program;
  qrDataUrl: string;
}

export function createTicket(program_id: number, payment_method: 'cash' | 'card') {
  return request<CreateTicketResponse>('/tickets', {
    method: 'POST',
    body: JSON.stringify({ program_id, payment_method }),
  });
}

export interface VerifyTicketResponse extends Ticket {
  program_name: string;
  duration: number;
  icon: string;
  program_price: number;
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
  program_name?: string;
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
  program_name: string;
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

export interface ProgramStat {
  name: string;
  count: number;
  total: number;
}

export interface ReportsResponse {
  report: ReportRow[];
  programStats: ProgramStat[];
}

export function getReports(period: 'daily' | 'weekly' | 'monthly') {
  return request<ReportsResponse>(`/admin/reports?period=${period}`);
}

export function updateProgram(id: number, data: Partial<Pick<Program, 'name' | 'price' | 'duration'>>) {
  return request<Program>(`/admin/programs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
