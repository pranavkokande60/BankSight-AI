/**
 * BankSight AI — Typed API Client
 * Connects React frontend to the FastAPI backend.
 */

const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('banksight_token') || sessionStorage.getItem('banksight_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('banksight_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('banksight_token');
  localStorage.removeItem('banksight_user');
  sessionStorage.removeItem('banksight_token');
  sessionStorage.removeItem('banksight_user');
}

export function getCurrentUser() {
  const u = localStorage.getItem('banksight_user') || sessionStorage.getItem('banksight_user');
  return u ? JSON.parse(u) : null;
}

export function setCurrentUser(user: any) {
  localStorage.setItem('banksight_user', JSON.stringify(user));
  sessionStorage.setItem('banksight_user', JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return (await res.text()) as unknown as T;
}

export const api = {
  // Auth
  login: (creds: { email: string; password?: string }) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
  getDemoAccounts: () =>
    request<any[]>('/auth/demo-accounts'),
  getMe: () =>
    request<any>('/auth/me'),

  // Dashboard & KPIs
  getSummary: () =>
    request<any>('/dashboard/summary'),
  getCharts: () =>
    request<any>('/dashboard/charts'),
  getAiSummary: () =>
    request<any>('/dashboard/ai-summary'),
  getNotifications: () =>
    request<any>('/notifications'),
  globalSearch: (q: string) =>
    request<any>(`/search?q=${encodeURIComponent(q)}`),
  getDataQuality: () =>
    request<any>('/data-quality'),

  // Customers
  getCustomers: (params?: {
    search?: string;
    country?: string;
    products?: number;
    is_active?: number;
    risk_category?: string;
    exited?: number;
    high_disagreement_only?: boolean;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_dir?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.country) q.append('country', params.country);
    if (params?.products) q.append('products', String(params.products));
    if (params?.is_active !== undefined) q.append('is_active', String(params.is_active));
    if (params?.risk_category) q.append('risk_category', params.risk_category);
    if (params?.exited !== undefined) q.append('exited', String(params.exited));
    if (params?.high_disagreement_only) q.append('high_disagreement_only', 'true');
    if (params?.limit) q.append('limit', String(params.limit));
    if (params?.offset) q.append('offset', String(params.offset));
    if (params?.sort_by) q.append('sort_by', params.sort_by);
    if (params?.sort_dir) q.append('sort_dir', params.sort_dir);
    return request<any>(`/customers?${q.toString()}`);
  },
  getCustomerProfile: (id: number) =>
    request<any>(`/customers/${id}`),

  // Segmentation & 3D Galaxy
  getGalaxyCoordinates: (k: number = 4, algo: string = 'kmeans') =>
    request<any>(`/segmentation/galaxy?k=${k}&algo=${algo}`),
  getClusterProfiles: (k: number = 4, algo: string = 'kmeans') =>
    request<any>(`/segmentation/clusters?k=${k}&algo=${algo}`),

  // ML Models & Risk Passport
  getModels: () =>
    request<any>('/models'),
  scoreCustomer: (data: any) =>
    request<any>('/predictions/score', { method: 'POST', body: JSON.stringify(data) }),
  explainCustomer: (data: any) =>
    request<any>('/predictions/explain', { method: 'POST', body: JSON.stringify(data) }),
  getCounterfactualRecourse: (data: any) =>
    request<any>('/predictions/counterfactual', { method: 'POST', body: JSON.stringify(data) }),

  // EARA Retention Intelligence
  allocateEARA: (params?: {
    budget?: number;
    weight_risk?: number;
    weight_balance?: number;
    weight_disagreement?: number;
    weight_segment?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.budget) q.append('budget', String(params.budget));
    if (params?.weight_risk !== undefined) q.append('weight_risk', String(params.weight_risk));
    if (params?.weight_balance !== undefined) q.append('weight_balance', String(params.weight_balance));
    if (params?.weight_disagreement !== undefined) q.append('weight_disagreement', String(params.weight_disagreement));
    if (params?.weight_segment !== undefined) q.append('weight_segment', String(params.weight_segment));
    return request<any>(`/eara/allocate?${q.toString()}`);
  },

  // Fairness & Trust
  getFairnessAudit: (groupCol: string = 'Geography', threshold: number = 0.50) =>
    request<any>(`/fairness/audit?group_col=${groupCol}&threshold=${threshold}`),

  // What-If Simulator & ECB Stress Testing
  getScenarioSimulation: (params?: {
    budget?: number;
    risk_threshold?: number;
    cost_per_contact?: number;
    success_rate?: number;
    margin_rate?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.budget) q.append('budget', String(params.budget));
    if (params?.risk_threshold !== undefined) q.append('risk_threshold', String(params.risk_threshold));
    if (params?.cost_per_contact !== undefined) q.append('cost_per_contact', String(params.cost_per_contact));
    if (params?.success_rate !== undefined) q.append('success_rate', String(params.success_rate));
    if (params?.margin_rate !== undefined) q.append('margin_rate', String(params.margin_rate));
    return request<any>(`/simulator/scenarios?${q.toString()}`);
  },
  getEcbStressTest: (scenario: string = 'ADVERSE_INFLATION_SHOCK', euriborBps: number = 0, balanceShockPct: number = 0) => {
    const q = new URLSearchParams();
    q.append('scenario', scenario);
    q.append('euribor_delta_bps', String(euriborBps));
    q.append('balance_shock_pct', String(balanceShockPct));
    return request<any>(`/simulator/stress-test?${q.toString()}`);
  },

  // AI Banking Assistant
  chatAssistant: (message: string) =>
    request<any>('/assistant/chat', { method: 'POST', body: JSON.stringify({ message }) }),

  // Survival Analysis & Dynamic CLTV
  getSurvivalKaplanMeier: (cohortBy: string = 'Geography') =>
    request<any>(`/survival/kaplan-meier?cohort_by=${encodeURIComponent(cohortBy)}`),
  getCoxHazards: () =>
    request<any>('/survival/cox-hazards'),
  getCustomerCLTV: (customerId: number = 15634602) =>
    request<any>(`/survival/cltv?customer_id=${customerId}`),

  // Causal Inference & Uplift Modeling
  getUpliftSummary: () =>
    request<any>('/uplift/summary'),
  getUpliftAccounts: (quadrant: string = 'Persuadables', limit: number = 25) =>
    request<any>(`/uplift/accounts?quadrant=${encodeURIComponent(quadrant)}&limit=${limit}`),

  // Household Graph & Churn Contagion
  getHouseholdGraph: (maxNodes: number = 120, contagionLambda: number = 0.25) =>
    request<any>(`/network/household-graph?max_nodes=${maxNodes}&contagion_lambda=${contagionLambda}`),

  // Continuous MLOps & PSI Sentinel
  getPSIDrift: (simulatedEuriborShift: number = 0.0, simulatedDepositShockPct: number = 0.0) =>
    request<any>(`/mlops/psi-drift?simulated_euribor_shift=${simulatedEuriborShift}&simulated_deposit_shock_pct=${simulatedDepositShockPct}`),

  // Data Comparison & Visualizer Suite (RouteNexa AI Style)
  getVisualizerMetadata: () =>
    request<any>('/visualizer/metadata'),
  getVisualizerData: (params?: {
    country?: string;
    products?: number;
    is_active?: number;
    gender?: string;
    risk_category?: string;
    min_balance?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.country && params.country !== 'ALL') q.append('country', params.country);
    if (params?.products !== undefined && params.products !== 0) q.append('products', String(params.products));
    if (params?.is_active !== undefined) q.append('is_active', String(params.is_active));
    if (params?.gender && params.gender !== 'ALL') q.append('gender', params.gender);
    if (params?.risk_category && params.risk_category !== 'ALL') q.append('risk_category', params.risk_category);
    if (params?.min_balance) q.append('min_balance', String(params.min_balance));
    return request<any>(`/visualizer/data?${q.toString()}`);
  },
  exportVisualizerCsvUrl: (params?: any) => {
    const q = new URLSearchParams();
    if (params?.country && params.country !== 'ALL') q.append('country', params.country);
    if (params?.products !== undefined && params.products !== 0) q.append('products', String(params.products));
    if (params?.is_active !== undefined) q.append('is_active', String(params.is_active));
    if (params?.gender && params.gender !== 'ALL') q.append('gender', params.gender);
    if (params?.risk_category && params.risk_category !== 'ALL') q.append('risk_category', params.risk_category);
    return `${API_BASE}/visualizer/export-csv?${q.toString()}`;
  },

  // Reports
  getExecutiveReport: () =>
    request<string>('/reports/executive'),
  getAcademicPaper: () =>
    request<string>('/reports/paper'),
  getGovernmentSummary: () =>
    request<string>('/reports/government-summary'),

  // Customer Management & Live Scoring
  getNextCustomerId: () =>
    request<any>('/customer-management/next-id'),
  getCustomerSummary: () =>
    request<any>('/customer-management/summary'),
  registerCustomer: (data: any) =>
    request<any>('/customer-management/register', { method: 'POST', body: JSON.stringify(data) }),
  listCustomers: (params?: { query?: string; status?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.query) q.append('query', params.query);
    if (params?.status && params.status !== 'ALL') q.append('status', params.status);
    if (params?.limit) q.append('limit', String(params.limit));
    return request<any>(`/customer-management/customers?${q.toString()}`);
  },
  getCustomer: (id: number) =>
    request<any>(`/customer-management/customers/${id}`),
  updateCustomer: (id: number, data: any) =>
    request<any>(`/customer-management/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateCustomerStatus: (id: number, status: string) =>
    request<any>(`/customer-management/customers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  predictCustomerRisk: (id: number, saveHistory: boolean = true) =>
    request<any>(`/customer-management/customers/${id}/predict?save_history=${saveHistory}`, { method: 'POST' }),
  getCustomerPredictionHistory: (id: number, limit: number = 50) =>
    request<any>(`/customer-management/customers/${id}/history?limit=${limit}`),
};
