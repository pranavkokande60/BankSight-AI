import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Database,
  ArrowRight,
  TrendingUp,
  Activity,
  UserCheck,
  Archive,
  Sliders,
  Sparkles,
  Info,
  Clock,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { api } from '../api';

export const CustomerManagementTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'directory' | 'profile'>('register');
  const [summary, setSummary] = useState<{ total: number; active: number; inactive: number; archived: number }>({
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
  });

  // Registration Form State
  const [useAutoId, setUseAutoId] = useState(true);
  const [suggestedId, setSuggestedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    surname: '',
    creditScore: 650,
    geography: 'France',
    gender: 'Female',
    age: 38,
    tenure: 3,
    balance: 45000,
    numOfProducts: 1,
    hasCrCard: 1,
    isActiveMember: 1,
    estimatedSalary: 62000,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredCustomer, setRegisteredCustomer] = useState<any | null>(null);

  // Instant ML Scoring State
  const [isScoring, setIsScoring] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any | null>(null);

  // Directory State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Profile Management State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<any[]>([]);
  const [editFormData, setEditFormData] = useState<any | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFeedback, setEditFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [allRegisteredCustomers, setAllRegisteredCustomers] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load Summary & Auto ID on mount
  useEffect(() => {
    loadSummary();
    loadNextId();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await api.getCustomerSummary();
      if (res.status === 'success') {
        setSummary({
          total: res.total,
          active: res.active,
          inactive: res.inactive,
          archived: res.archived,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadNextId = async () => {
    try {
      const res = await api.getNextCustomerId();
      if (res.status === 'success') {
        setSuggestedId(res.suggested_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Directory when directory sub-tab is active
  useEffect(() => {
    if (activeSubTab === 'directory') {
      fetchDirectory();
    }
  }, [activeSubTab, statusFilter, searchQuery]);

  // Fetch all registered customers and auto-select when entering Profile tab
  useEffect(() => {
    api.listCustomers({ limit: 200 })
      .then((res) => {
        const list = res.customers || [];
        setAllRegisteredCustomers(list);
        if (activeSubTab === 'profile' && list.length > 0 && (!selectedCustomerId || !selectedCustomer)) {
          selectCustomerForProfile(list[0].customer_id);
        }
      })
      .catch(console.error);
  }, [activeSubTab, summary.total]);

  const fetchDirectory = async () => {
    setIsLoadingList(true);
    try {
      const res = await api.listCustomers({
        query: searchQuery,
        status: statusFilter,
        limit: 100,
      });
      setCustomerList(res.customers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setIsRegistering(true);
    setPredictionResult(null);

    const targetId = useAutoId ? suggestedId : parseInt(formData.customerId, 10);
    if (!targetId || isNaN(targetId) || targetId <= 0) {
      setFormErrors(['Please provide a valid positive integer Customer ID.']);
      setIsRegistering(false);
      return;
    }

    const payload = {
      customer_id: targetId,
      surname: formData.surname.trim() || undefined,
      credit_score: Number(formData.creditScore),
      geography: formData.geography,
      gender: formData.gender,
      age: Number(formData.age),
      tenure: Number(formData.tenure),
      balance: Number(formData.balance),
      num_of_products: Number(formData.numOfProducts),
      has_cr_card: Number(formData.hasCrCard),
      is_active_member: Number(formData.isActiveMember),
      estimated_salary: Number(formData.estimatedSalary),
      record_status: 'ACTIVE',
    };

    try {
      const res = await api.registerCustomer(payload);
      if (res.status === 'success') {
        setRegisteredCustomer(res.customer);
        loadSummary();
        loadNextId();
        window.dispatchEvent(new CustomEvent('customer-registered'));
        // Trigger auto prediction
        runLiveScoring(res.customer.customer_id);
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Registration failed.']);
    } finally {
      setIsRegistering(false);
    }
  };

  // Run live scoring on registered customer
  const runLiveScoring = async (customerId: number) => {
    setIsScoring(true);
    try {
      const res = await api.predictCustomerRisk(customerId, true);
      if (res.status === 'success') {
        setPredictionResult(res.prediction);
      }
    } catch (err: any) {
      console.error('Scoring error:', err);
    } finally {
      setIsScoring(false);
    }
  };

  // Load Customer Profile & History
  const selectCustomerForProfile = async (customerId: number) => {
    setSelectedCustomerId(customerId);
    setActiveSubTab('profile');
    setIsLoadingProfile(true);
    setEditFeedback(null);
    try {
      const custRes = await api.getCustomer(customerId);
      if (custRes.status === 'success') {
        setSelectedCustomer(custRes.customer);
        setEditFormData({ ...custRes.customer });
      }
      const histRes = await api.getCustomerPredictionHistory(customerId);
      if (histRes.status === 'success') {
        setPredictionHistory(histRes.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Save Edit Profile
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !editFormData) return;
    setIsSavingEdit(true);
    setEditFeedback(null);

    const payload = {
      surname: editFormData.surname,
      credit_score: Number(editFormData.credit_score),
      geography: editFormData.geography,
      gender: editFormData.gender,
      age: Number(editFormData.age),
      tenure: Number(editFormData.tenure),
      balance: Number(editFormData.balance),
      num_of_products: Number(editFormData.num_of_products),
      has_cr_card: Number(editFormData.has_cr_card),
      is_active_member: Number(editFormData.is_active_member),
      estimated_salary: Number(editFormData.estimated_salary),
    };

    try {
      const res = await api.updateCustomer(selectedCustomerId, payload);
      if (res.status === 'success') {
        setSelectedCustomer(res.customer);
        setEditFormData({ ...res.customer });
        setEditFeedback({ type: 'success', message: 'Customer profile updated successfully!' });
        loadSummary();
      }
    } catch (err: any) {
      setEditFeedback({ type: 'error', message: err.message || 'Update failed.' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Change Status
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedCustomerId) return;
    try {
      const res = await api.updateCustomerStatus(selectedCustomerId, newStatus);
      if (res.status === 'success') {
        setSelectedCustomer(res.customer);
        if (editFormData) setEditFormData({ ...editFormData, record_status: newStatus });
        loadSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Re-score from Profile tab
  const handleProfileRescore = async () => {
    if (!selectedCustomerId) return;
    setIsScoring(true);
    try {
      const res = await api.predictCustomerRisk(selectedCustomerId, true);
      if (res.status === 'success') {
        const histRes = await api.getCustomerPredictionHistory(selectedCustomerId);
        if (histRes.status === 'success') {
          setPredictionHistory(histRes.history || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 p-6 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Persistent Customer Engine
            </span>
            <span className="text-xs text-slate-400">SQLite Persistent Storage · Unknown Churn Isolation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-cyan-400" />
            Customer Management & Live Scoring
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Register new customers with strict schema validation, prevent duplicate records, and run real-time ML churn risk assessments.
          </p>
        </div>

        {/* Quick KPI Cards */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <div className="text-xs text-slate-400 font-medium">Registered</div>
            <div className="text-lg font-bold text-cyan-400">{summary.total.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <div className="text-xs text-slate-400 font-medium">Active Accounts</div>
            <div className="text-lg font-bold text-emerald-400">{summary.active.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <div className="text-xs text-slate-400 font-medium">Archived</div>
            <div className="text-lg font-bold text-slate-400">{summary.archived.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveSubTab('register')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'register'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Register New Customer
        </button>
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'directory'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          Customer Directory & Search
        </button>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'profile'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Profile & Lifecycle Management
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: REGISTER NEW CUSTOMER */}
      {/* ========================================================================= */}
      {activeSubTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Registration Form */}
          <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  New Customer Registration Form
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Validates numeric bounds, prevents duplicate keys, and keeps original CSV dataset untouched.
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                SQLite Engine
              </span>
            </div>

            {/* Regulatory Notice */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-200/90 leading-relaxed">
                <span className="font-semibold text-blue-300">Regulatory Integrity Principle</span>: The{' '}
                <code className="text-cyan-300">Exited</code> attribute represents an observed historical event. Newly
                registered accounts have an unknown outcome; the label is strictly persisted as{' '}
                <code className="text-amber-300">NULL</code> to prevent supervised model contamination.
              </div>
            </div>

            {/* Error Banner */}
            {formErrors.length > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-rose-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="w-4 h-4" /> Registration Validation Errors:
                </div>
                {formErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Section 1: Customer ID */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Customer Identification</label>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={useAutoId}
                      onChange={() => setUseAutoId(true)}
                      className="accent-cyan-400"
                    />
                    <span>Auto-generate unique ID ({suggestedId ?? '...'})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!useAutoId}
                      onChange={() => setUseAutoId(false)}
                      className="accent-cyan-400"
                    />
                    <span>Manual ID entry</span>
                  </label>
                </div>
                {!useAutoId && (
                  <input
                    type="number"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    placeholder="e.g. 15820005"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                )}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Customer Surname (Optional — Excluded from ML features)</label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    placeholder="e.g. Müller, Dupont, Garcia"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Section 2: Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Geography (Sovereign)</label>
                  <select
                    value={formData.geography}
                    onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Spain">Spain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Age (18 - 100)</label>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Section 3: Financials & Relationship */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Credit Score (300 - 850)</label>
                  <input
                    type="number"
                    min={300}
                    max={850}
                    value={formData.creditScore}
                    onChange={(e) => setFormData({ ...formData, creditScore: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tenure (0 - 10 Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={formData.tenure}
                    onChange={(e) => setFormData({ ...formData, tenure: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Products Held (1 - 4)</label>
                  <select
                    value={formData.numOfProducts}
                    onChange={(e) => setFormData({ ...formData, numOfProducts: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value={1}>1 Product (Standard)</option>
                    <option value={2}>2 Products (Core)</option>
                    <option value={3}>3 Products (High Risk)</option>
                    <option value={4}>4 Products (Severe Hazard)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Account Balance (€ EUR)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estimated Annual Salary (€ EUR)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formData.estimatedSalary}
                    onChange={(e) => setFormData({ ...formData, estimatedSalary: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Credit Card Facility</label>
                  <select
                    value={formData.hasCrCard}
                    onChange={(e) => setFormData({ ...formData, hasCrCard: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value={1}>Yes (Active Card)</option>
                    <option value={0}>No (No Card)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Active Membership Status</label>
                  <select
                    value={formData.isActiveMember}
                    onChange={(e) => setFormData({ ...formData, isActiveMember: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value={1}>Active Member (Transacting)</option>
                    <option value={0}>Inactive (Dormant)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRegistering ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Validating & Persisting to SQLite...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Register Customer & Run Live ML Scoring
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Panel: Live ML Risk Assessment */}
          <div className="lg:col-span-5 space-y-6">
            {registeredCustomer ? (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Registration Confirmed
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      Account #{registeredCustomer.customer_id}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {registeredCustomer.record_status}
                    </span>
                  </div>
                </div>

                {/* Churn Status Banner */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Observed Outcome (Exited):</span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    NULL (Pending Future Churn Event)
                  </span>
                </div>

                {/* Live Scoring Display */}
                {isScoring ? (
                  <div className="py-12 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-sm text-slate-300">Evaluating multi-model consensus & SHAP attributions...</p>
                  </div>
                ) : predictionResult ? (
                  <div className="space-y-4">
                    {/* Probability & Risk Tier */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-xs text-slate-400">Predicted Churn Probability</div>
                        <div className="text-2xl font-bold text-cyan-400 mt-1">
                          {(predictionResult.predicted_churn_prob * 100).toFixed(1)}%
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Ensemble: {(predictionResult.ensemble_mean_prob * 100).toFixed(1)}%
                        </div>
                      </div>

                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-xs text-slate-400">Calibrated Risk Tier</div>
                        <div
                          className={`text-lg font-bold mt-1 ${
                            predictionResult.risk_tier.includes('Critical')
                              ? 'text-rose-400'
                              : predictionResult.risk_tier.includes('High')
                              ? 'text-amber-400'
                              : predictionResult.risk_tier.includes('Moderate')
                              ? 'text-indigo-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {predictionResult.risk_tier}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{predictionResult.model_name}</div>
                      </div>
                    </div>

                    {/* Disagreement Warning */}
                    {predictionResult.has_disagreement && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Model Disagreement Warning</span>: Spread is{' '}
                          {(predictionResult.model_spread * 100).toFixed(1)}%. Architectures diverge on this profile.
                        </div>
                      </div>
                    )}

                    {/* Persona & Cluster */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                      <div className="text-xs text-slate-400">Assigned Cluster Persona</div>
                      <div className="text-sm font-semibold text-cyan-300 mt-0.5">
                        {predictionResult.cluster_name}
                      </div>
                    </div>

                    {/* Top SHAP Drivers */}
                    {predictionResult.shap_attributions && predictionResult.shap_attributions.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Top Risk Drivers (SHAP Local Attribution)</span>
                          <span className="text-[10px] text-slate-400">Directional</span>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {predictionResult.shap_attributions.slice(0, 5).map((att: any, idx: number) => {
                            const isHazard = att.Attribution > 0;
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-xs"
                              >
                                <span className="text-slate-300 font-mono text-[11px]">{att.Feature}</span>
                                <span
                                  className={`font-semibold font-mono ${
                                    isHazard ? 'text-rose-400' : 'text-emerald-400'
                                  }`}
                                >
                                  {isHazard ? '+' : ''}
                                  {att.Attribution.toFixed(3)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Advisories */}
                    {predictionResult.advisories && predictionResult.advisories.length > 0 && (
                      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
                        <div className="text-xs font-semibold text-slate-300">Data Quality & Model Advisories:</div>
                        {predictionResult.advisories.map((adv: string, i: number) => (
                          <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1">
                            <span className="text-amber-400">•</span> {adv}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => runLiveScoring(registeredCustomer.customer_id)}
                    className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" /> Run Live ML Risk Scoring
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">Instant Machine Learning Scoring</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Upon submitting the registration form, the existing validated ML model artifacts will score the customer
                  in real-time and display SHAP explainability insights.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: CUSTOMER DIRECTORY & SEARCH */}
      {/* ========================================================================= */}
      {activeSubTab === 'directory' && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-cyan-400" />
                Registered Customer Directory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Search persistent SQLite database records by Customer ID or Surname with status filtering.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by ID or Surname..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
                <option value="ARCHIVED">Archived Only</option>
              </select>

              <button
                onClick={fetchDirectory}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700"
                title="Refresh Directory"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3">Surname</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Geography</th>
                  <th className="px-4 py-3">Age / Gen</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Exited (Observed)</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {isLoadingList ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                      Querying persistent SQLite customer table...
                    </td>
                  </tr>
                ) : customerList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                      No customer records found matching the query.
                    </td>
                  </tr>
                ) : (
                  customerList.map((cust) => (
                    <tr key={cust.customer_id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">{cust.customer_id}</td>
                      <td className="px-4 py-3 text-white font-medium">{cust.surname || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            cust.record_status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : cust.record_status === 'INACTIVE'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}
                        >
                          {cust.record_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{cust.geography}</td>
                      <td className="px-4 py-3">
                        {cust.age} yrs · {cust.gender === 'Female' ? 'F' : 'M'}
                      </td>
                      <td className="px-4 py-3 font-mono">€{cust.balance.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            cust.num_of_products >= 3 ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {cust.num_of_products} prods
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          NULL (Unknown)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {new Date(cust.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => selectCustomerForProfile(cust.customer_id)}
                          className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-xs font-semibold transition-all"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: CUSTOMER PROFILE & LIFECYCLE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6">
          {/* Top Customer Selector Bar */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Active Customer Profile
                  {selectedCustomerId && (
                    <span className="text-xs font-mono font-normal text-cyan-400">
                      (ID #{selectedCustomerId})
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400">
                  Select and inspect any persistent SQLite customer record to edit attributes, manage status, and track prediction history.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400 font-medium shrink-0">Switch Account:</label>
              <select
                value={selectedCustomerId || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val) selectCustomerForProfile(val);
                }}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 min-w-[260px] font-medium"
              >
                {allRegisteredCustomers.length === 0 ? (
                  <option value="">No registered customers found</option>
                ) : (
                  allRegisteredCustomers.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      #{c.customer_id} — {c.surname ? `${c.surname} · ` : ''}{c.geography} (€{c.balance.toLocaleString()}) [{c.record_status}]
                    </option>
                  ))
                )}
              </select>

              <button
                onClick={() => setActiveSubTab('register')}
                className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register New
              </button>
            </div>
          </div>

          {isLoadingProfile ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">Loading customer profile...</h4>
            </div>
          ) : !selectedCustomer ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-semibold text-white">No Registered Customers in Registry</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The persistent SQLite customer database has no records yet. Register a customer record to enable profile editing, lifecycle transitions, and prediction audit tracking.
              </p>
              <button
                onClick={() => setActiveSubTab('register')}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <UserPlus className="w-4 h-4" /> Go to Customer Registration Form
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Profile Editor */}
              <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono text-cyan-400">ID #{selectedCustomer.customer_id}</span>
                    <h3 className="text-lg font-bold text-white">
                      {selectedCustomer.surname ? `Customer Profile: ${selectedCustomer.surname}` : 'Customer Profile'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={selectedCustomer.record_status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                {editFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      editFeedback.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    }`}
                  >
                    {editFeedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {editFeedback.message}
                  </div>
                )}

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Surname</label>
                      <input
                        type="text"
                        value={editFormData?.surname || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, surname: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Geography</label>
                      <select
                        value={editFormData?.geography || 'France'}
                        onChange={(e) => setEditFormData({ ...editFormData, geography: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="France">France</option>
                        <option value="Germany">Germany</option>
                        <option value="Spain">Spain</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Age</label>
                      <input
                        type="number"
                        min={18}
                        max={100}
                        value={editFormData?.age || 38}
                        onChange={(e) => setEditFormData({ ...editFormData, age: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Credit Score</label>
                      <input
                        type="number"
                        min={300}
                        max={850}
                        value={editFormData?.credit_score || 650}
                        onChange={(e) => setEditFormData({ ...editFormData, credit_score: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tenure (Years)</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={editFormData?.tenure || 3}
                        onChange={(e) => setEditFormData({ ...editFormData, tenure: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Account Balance (€)</label>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={editFormData?.balance || 0}
                        onChange={(e) => setEditFormData({ ...editFormData, balance: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Estimated Salary (€)</label>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={editFormData?.estimated_salary || 0}
                        onChange={(e) => setEditFormData({ ...editFormData, estimated_salary: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Products Held</label>
                      <select
                        value={editFormData?.num_of_products || 1}
                        onChange={(e) => setEditFormData({ ...editFormData, num_of_products: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value={1}>1 Product</option>
                        <option value={2}>2 Products</option>
                        <option value={3}>3 Products</option>
                        <option value={4}>4 Products</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Credit Card</label>
                      <select
                        value={editFormData?.has_cr_card ?? 1}
                        onChange={(e) => setEditFormData({ ...editFormData, has_cr_card: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value={1}>Yes (1)</option>
                        <option value={0}>No (0)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Active Member</label>
                      <select
                        value={editFormData?.is_active_member ?? 1}
                        onChange={(e) => setEditFormData({ ...editFormData, is_active_member: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value={1}>Yes (1)</option>
                        <option value={0}>No (0)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Save Profile Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleProfileRescore}
                      disabled={isScoring}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isScoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-cyan-400" />}
                      Re-Run ML Prediction
                    </button>
                  </div>
                </form>
              </div>

              {/* Prediction History Timeline */}
              <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Prediction Audit History
                  </h3>
                  <span className="text-xs text-slate-400">{predictionHistory.length} record(s)</span>
                </div>

                {predictionHistory.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                    <p>No historical prediction scorings logged for this customer.</p>
                    <button
                      onClick={handleProfileRescore}
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      Run initial prediction <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {predictionHistory.map((h, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(h.scored_at).toLocaleString()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              h.risk_tier.includes('Critical')
                                ? 'bg-rose-500/20 text-rose-400'
                                : h.risk_tier.includes('High')
                                ? 'bg-amber-500/20 text-amber-400'
                                : h.risk_tier.includes('Moderate')
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {h.risk_tier}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">Predicted Churn:</span>
                          <span className="font-bold text-cyan-400">
                            {(h.predicted_churn_prob * 100).toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-900 pt-1.5">
                          <span>Model: {h.model_name}</span>
                          <span>Spread: {(h.model_spread * 100).toFixed(1)}%</span>
                        </div>

                        {h.cluster_name && (
                          <div className="text-[11px] text-cyan-300/80">Persona: {h.cluster_name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
