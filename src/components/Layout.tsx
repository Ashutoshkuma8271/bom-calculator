import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calculator, 
  FileText, 
  Package, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Search,
  Bell,
  User,
  LogOut,
  Shield,
  LucideIcon,
  Sparkles,
  Plus,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Globe,
  ArrowRight,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import useAuthStore from '../stores/authStore';
import useBOMStore from '../stores/bomStore';
import AuthModal from './AuthModal';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { boms, materials, currency, setCurrency, setCurrentBOM } = useBOMStore();

  const notifications = [
    { id: 1, title: 'Batch #AF-MOM-001 Ready', desc: 'Blast freeze cycle completed (-40°C verified)', time: '10m ago', unread: true },
    { id: 2, title: 'Low Inventory Alert', desc: 'Vacuum barrier pouches below reorder threshold (3,000 left)', time: '1h ago', unread: true },
    { id: 3, title: 'Cold Chain Transit', desc: '500 insulated home delivery packs dispatched via express cold route', time: '3h ago', unread: false },
  ];

  const baseNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'BOM Calculator', href: '/calculator', icon: Calculator, badge: 'Live' },
    { name: 'BOM Registry', href: '/boms', icon: FileText, badge: `${boms.length}` },
    { name: 'Materials & Stock', href: '/materials', icon: Package, badge: `${materials.length}` },
    { name: 'Analytics & Reports', href: '/reports', icon: BarChart3 },
  ];

  const adminNavigation: NavigationItem[] = user?.role === 'admin' 
    ? [...baseNavigation, { name: 'Admin Control', href: '/admin', icon: Shield }]
    : baseNavigation;

  const navigation: NavigationItem[] = [...adminNavigation, { name: 'Settings', href: '/settings', icon: Settings }];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Keyboard shortcut Ctrl+K / Cmd+K for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = searchQuery.trim() === '' ? [] : [
    ...boms
      .filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.projectCode?.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(b => ({ type: 'bom' as const, id: b.id, title: b.name, subtitle: `${b.projectCode || 'BOM'} • ${b.status} • v${b.version}`, item: b })),
    ...materials
      .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(m => ({ type: 'material' as const, id: m.id, title: m.name, subtitle: `${m.category} • ${m.unit} • ${m.storageCondition || 'Ambient'}`, item: m })),
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl z-50"
            >
              <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100 bg-white">
                <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center space-x-3">
                  <div className="bg-emerald-600 p-2.5 rounded-xl shadow-md text-white flex items-center justify-center">
                    <Flame className="h-5 w-5 fill-white text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-lg font-extrabold text-slate-900 tracking-tight font-display">AKIRA</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 tracking-wide uppercase">FRESH</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">BOM & Costing Engine</p>
                  </div>
                </Link>
                <button 
                  onClick={() => setSidebarOpen(false)} 
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 active:scale-95 transition-transform"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-4 py-4">
                <Link
                  to="/calculator"
                  onClick={() => {
                    setCurrentBOM(null);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Create New BOM</span>
                </Link>
              </div>
              <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                        active
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-100/80 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className={`h-4 w-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${active ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-600'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Cold-Chain Verified
                  </span>
                  <a href="https://akirafresh.in" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                    akirafresh.in <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Navigation Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-30">
        <div className="flex flex-col flex-1 bg-white border-r border-slate-200/80 shadow-xs">
          {/* Logo Header */}
          <div className="flex h-20 items-center px-6 border-b border-slate-100">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-emerald-600 p-2.5 rounded-2xl shadow-md shadow-emerald-600/20 text-white flex items-center justify-center transition-all"
              >
                <Flame className="h-5 w-5 fill-white text-white" />
              </motion.div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight font-display">AKIRA</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-100 text-emerald-800 tracking-wider uppercase">FRESH</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">BOM & Costing Engine</p>
              </div>
            </Link>
          </div>

          {/* Quick Action Button */}
          <div className="px-5 pt-5 pb-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/calculator"
                onClick={() => setCurrentBOM(null)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Create New BOM</span>
              </Link>
            </motion.div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-3 flex-1 overflow-y-auto space-y-1">
            <div className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Main Menu</div>
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    active
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-100/80 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 z-10">
                    <item.icon className={`h-4 w-4 transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`z-10 text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${active ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom Info Banner */}
          <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white shadow-md border border-emerald-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">Akira Fresh D2C</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-emerald-100/85 leading-relaxed">
              Blast-frozen ready-to-cook delicacies with 48h thermal cold chain intelligence.
            </p>
            <a
              href="https://akirafresh.in"
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white transition-colors"
            >
              Visit Store: akirafresh.in <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Top Header & Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
              title="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 font-medium">
              <span>Akira Hub</span>
              <span>/</span>
              <span className="text-slate-900 font-bold capitalize">
                {location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '').replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Center Search Trigger */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs text-slate-400 transition-all text-left group shadow-2xs"
            >
              <span className="flex items-center space-x-2">
                <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                <span className="text-slate-500 font-medium">Search recipes, BOMs, raw ingredients...</span>
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </motion.button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Currency Switcher */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 py-1.5 pl-3 pr-7 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
              <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Notification Tray */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-40"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900 font-display">Activity & Alerts</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">2 New</span>
                        </div>
                        <button onClick={() => setShowNotifications(false)} className="text-xs text-emerald-700 hover:underline font-bold">
                          Mark read
                        </button>
                      </div>
                      <div className="divide-y divide-slate-50 my-1 max-h-72 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50/80 rounded-xl transition-colors">
                            <div className="flex items-start justify-between">
                              <p className="text-xs font-bold text-slate-900">{n.title}</p>
                              <span className="text-[10px] text-slate-400">{n.time}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60 shadow-2xs">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
                    <p className="text-[10px] text-emerald-700 font-bold capitalize leading-none">{user?.role}</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
              >
                <User className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </motion.button>
            )}
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <AnimatePresence>
        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" 
              onClick={() => setSearchModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10"
            >
              <div className="flex items-center px-4 border-b border-slate-100 bg-slate-50/50">
                <Search className="h-4 w-4 text-emerald-600 mr-3" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipe BOMs, materials, batches, SKUs..."
                  className="w-full py-4 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-900 font-semibold placeholder-slate-400"
                />
                <button
                  onClick={() => setSearchModalOpen(false)}
                  className="text-xs bg-slate-200/80 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded-md font-bold"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {searchQuery.trim() === '' ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Type to instantly search across all Akira recipe BOMs, ingredients, and storage conditions.
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No matching results for "{searchQuery}".
                  </div>
                ) : (
                  searchResults.map((res) => (
                    <button
                      key={`${res.type}-${res.id}`}
                      onClick={() => {
                        if (res.type === 'bom') {
                          setCurrentBOM(res.item as any);
                          navigate('/calculator');
                        } else {
                          navigate('/materials');
                        }
                        setSearchModalOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 text-left transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${res.type === 'bom' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {res.type === 'bom' ? <FileText className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">{res.title}</p>
                          <p className="text-[11px] text-slate-500">{res.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Open <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default Layout;

