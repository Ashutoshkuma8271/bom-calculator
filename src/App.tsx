import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Flame } from 'lucide-react';
import Layout from './components/Layout';

// Lazy loaded page chunks for fast initial load
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BOMCalculator = lazy(() => import('./pages/BOMCalculator'));
const BOMList = lazy(() => import('./pages/BOMList'));
const Materials = lazy(() => import('./pages/Materials'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Sleek fast loading fallback
const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
    <div className="relative flex items-center justify-center">
      <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 dark:bg-emerald-500/20 animate-ping absolute" />
      <div className="w-10 h-10 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 relative">
        <Flame className="w-5 h-5 fill-white animate-pulse" />
      </div>
    </div>
    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
      <span>Akira Fresh Engine</span>
      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calculator" element={<BOMCalculator />} />
              <Route path="/boms" element={<BOMList />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Suspense>
        </Layout>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;