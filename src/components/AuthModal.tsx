import React, { useState } from 'react';
import { X, LogIn, UserPlus, Flame, Shield, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../stores/authStore';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('admin@akirafresh.in');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('Ashutosh Kumar');
  const [error, setError] = useState('');
  
  const { login, register } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const success = login(email, password);
      if (!success) {
        setError('Invalid credentials. You can use admin@akirafresh.in / admin123 or register.');
      } else {
        onClose();
      }
    } else {
      const success = register(name, email, password);
      if (!success) {
        setError('Registration failed. Please try again.');
      } else {
        onClose();
      }
    }
  };

  const handleQuickDemo = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@akirafresh.in');
      setPassword('admin123');
      login('admin@akirafresh.in', 'admin123');
    } else {
      setEmail('user@akirafresh.in');
      setPassword('user123');
      login('user@akirafresh.in', 'user123');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-200 animate-slide-up space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                {isLogin ? 'Sign In to Akira Fresh' : 'Create Team Account'}
              </h2>
              <p className="text-xs text-slate-500">BOM Recipe & Inventory System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ashutosh Kumar"
                className="w-full px-3.5 py-2 text-xs text-slate-900 font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@akirafresh.in"
              className="w-full px-3.5 py-2 text-xs text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-xs text-slate-900 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all mt-2"
          >
            {isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">
            Quick 1-Click Demo Roles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo('admin')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              Sign In as Admin
            </button>
            <button
              onClick={() => handleQuickDemo('user')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              Sign In as Operator
            </button>
          </div>
        </div>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            {isLogin ? "Don't have an account? Create one" : 'Already registered? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
