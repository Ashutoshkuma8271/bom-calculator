import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Sparkles
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import AuthModal from './AuthModal';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const baseNavigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'BOM Calculator', href: '/calculator', icon: Calculator },
    { name: 'BOM List', href: '/boms', icon: FileText },
    { name: 'Materials', href: '/materials', icon: Package },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  const adminNavigation: NavigationItem[] = user?.role === 'admin' 
    ? [...baseNavigation, { name: 'Admin', href: '/admin', icon: Shield }]
    : baseNavigation;

  const navigation: NavigationItem[] = [...adminNavigation, { name: 'Settings', href: '/settings', icon: Settings }];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl">
          <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200 bg-gradient-to-r from-primary-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                BOM Calculator
              </span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-premium">
          <div className="flex h-20 items-center px-6 border-b border-slate-200/50 bg-gradient-to-r from-primary-50/50 to-white">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl shadow-lg shadow-primary-500/25">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                BOM Calculator
              </span>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <div className="sticky top-0 z-10 flex h-20 items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex items-center justify-between">
            <div className="flex-1 flex items-center max-w-lg">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search BOMs, materials..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200 shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </button>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-slate-400 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-primary-50"
                  title="Login"
                >
                  <User className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">{children}</main>
      </div>
      
      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default Layout;