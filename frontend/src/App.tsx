import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabKey } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { LoginModal } from './components/LoginModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { NotificationCenterDrawer } from './components/NotificationCenterDrawer';

// Tabs
import { DashboardTab } from './components/DashboardTab';
import { CustomerManagementTab } from './components/CustomerManagementTab';
import { DataComparisonTab } from './components/DataComparisonTab';
import { LiveOperationsTab } from './components/LiveOperationsTab';
import { GeospatialMapTab } from './components/GeospatialMapTab';
import { Galaxy3DTab } from './components/Galaxy3DTab';
import { QualityTab } from './components/QualityTab';
import { SegmentationTab } from './components/SegmentationTab';
import { ChurnIntelTab } from './components/ChurnIntelTab';
import { SurvivalCLTVTab } from './components/SurvivalCLTVTab';
import { UpliftModelingTab } from './components/UpliftModelingTab';
import { HouseholdGraphTab } from './components/HouseholdGraphTab';
import { PSISentinelTab } from './components/PSISentinelTab';
import { ModelLabTab } from './components/ModelLabTab';
import { ExplainabilityTab } from './components/ExplainabilityTab';
import { RiskPassportTab } from './components/RiskPassportTab';
import { PredictionPlaygroundTab } from './components/PredictionPlaygroundTab';
import { EARALabTab } from './components/EARALabTab';
import { FairnessTab } from './components/FairnessTab';
import { SimulationTab } from './components/SimulationTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { ReportsTab } from './components/ReportsTab';

import { api, getCurrentUser, clearAuthToken, setCurrentUser as setCurrentUserLocal, setAuthToken } from './api';

const PRANAV_USER = {
  id: "usr_ds_02",
  email: "pranav.kokande@banksight.eu",
  name: "Pranav Kokande",
  role: "Lead Quantitative Researcher & AI Architect",
  department: "Advanced Analytics & XAI Lab",
  avatar: "/pranav_avatar.jpg",
  token: "banksight_token_lead_data_scientist_2026",
};

const TAB_SECTION_NAMES: Record<string, string> = {
  dashboard: 'Executive Decision Dashboard',
  'customer-mgmt': 'Customer Portfolio Management',
  geospatial: 'European Geospatial Intelligence',
  galaxy3d: '3D Customer Galaxy',
  segmentation: 'Customer Segments & Personas',
  'churn-intel': 'Churn Risk Intelligence',
  'model-lab': 'Model Lab & Performance Diagnostics',
  explainability: 'Explainability & SHAP Studio',
  'risk-passport': 'Customer Risk Passports',
  quality: 'Data Quality & Validation Centre',
  survival: 'CLTV & Survival Analysis',
  'eara-lab': 'EARA Strategic Retention Lab',
  playground: 'Prediction Playground',
  fairness: 'Algorithmic Fairness Audit',
  simulator: 'Portfolio Simulation Engine',
  'mlops-psi': 'PSI Sentinel Drift Monitor',
  'ai-assistant': 'AI Banking Assistant',
  reports: 'Executive Audit Dossier',
  'data-comparison': 'Data Comparison Studio',
  'live-ops': 'Live Operations Stream',
  'household-graph': 'Household Contagion Graph',
  uplift: 'Uplift & Treatment Lab',
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const isSessionActive = sessionStorage.getItem('banksight_session_active') === 'true';
    if (!isSessionActive) {
      clearAuthToken();
      return null;
    }
    return getCurrentUser();
  });

  const [currentTab, setCurrentTab] = useState<TabKey>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as TabKey;
    if (tabParam) return tabParam;
    return 'landing';
  });
  const [pendingTab, setPendingTab] = useState<TabKey>('dashboard');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(4);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Keyboard shortcut: Ctrl + K / Cmd + K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    api.getNotifications()
      .then((res) => {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unread_count || 0);
      })
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('banksight_session_active');
    clearAuthToken();
    setCurrentUser(null);
    setCurrentTab('landing');
  };

  const handleLoginSuccess = (user: any) => {
    sessionStorage.setItem('banksight_session_active', 'true');
    setCurrentUser(user);
    const destination = pendingTab || 'dashboard';
    setCurrentTab(destination);
    setIsLoginOpen(false);
  };

  // Protected navigation: requires sign in as Pranav Kokande first
  const handleProtectedNavigate = (tab: TabKey) => {
    if (!currentUser) {
      setPendingTab(tab);
      setIsLoginOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <div className={`min-h-screen font-['Plus_Jakarta_Sans',sans-serif] ${currentTab === 'landing' ? '' : 'bg-slate-950 text-slate-100'}`}>
      {currentTab === 'landing' ? (
        <LandingPage
          onOpenLogin={() => {
            setPendingTab('dashboard');
            setIsLoginOpen(true);
          }}
          onEnterDashboard={() => handleProtectedNavigate('dashboard')}
          onNavigateGalaxy={() => handleProtectedNavigate('galaxy3d')}
          onNavigateTab={(tab: TabKey) => handleProtectedNavigate(tab)}
          isAuthenticated={!!currentUser}
          currentUser={currentUser}
        />
      ) : (
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Top Navbar */}
          <Navbar
            onOpenLogin={() => {
              setPendingTab(currentTab);
              setIsLoginOpen(true);
            }}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onLogout={handleLogout}
            onNavigateLanding={() => setCurrentTab('landing')}
            currentUser={currentUser}
            unreadCount={unreadCount}
          />

          {/* Main App Container */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => setCurrentTab(tab)}
            />

            {/* Active Tab View */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              {currentTab === 'dashboard' && <DashboardTab />}
              {currentTab === 'customer-mgmt' && <CustomerManagementTab />}
              {currentTab === 'data-comparison' && <DataComparisonTab />}
              {currentTab === 'live-ops' && <LiveOperationsTab />}
              {currentTab === 'geospatial' && <GeospatialMapTab />}
              {currentTab === 'galaxy3d' && <Galaxy3DTab />}
              {currentTab === 'quality' && <QualityTab />}
              {currentTab === 'segmentation' && <SegmentationTab />}
              {currentTab === 'churn-intel' && <ChurnIntelTab />}
              {currentTab === 'survival' && <SurvivalCLTVTab />}
              {currentTab === 'household-graph' && <HouseholdGraphTab />}
              {currentTab === 'model-lab' && <ModelLabTab />}
              {currentTab === 'explainability' && <ExplainabilityTab />}
              {currentTab === 'risk-passport' && <RiskPassportTab />}
              {currentTab === 'playground' && <PredictionPlaygroundTab />}
              {currentTab === 'eara-lab' && <EARALabTab />}
              {currentTab === 'uplift' && <UpliftModelingTab />}
              {currentTab === 'fairness' && <FairnessTab />}
              {currentTab === 'simulator' && <SimulationTab />}
              {currentTab === 'mlops-psi' && <PSISentinelTab />}
              {currentTab === 'ai-assistant' && <AIAssistantTab />}
              {currentTab === 'reports' && <ReportsTab />}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        targetSection={TAB_SECTION_NAMES[pendingTab] || 'Decision Terminal'}
      />

      <NotificationCenterDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
};
