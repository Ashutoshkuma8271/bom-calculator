import React from 'react';
import { Shield, Users, Settings, Activity, AlertTriangle, Sparkles, ArrowUpRight } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useBOMStore from '../stores/bomStore';
import { formatCurrency } from '../lib/utils';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { boms, materials } = useBOMStore();

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Access Denied</h2>
          <p className="text-slate-500 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const adminStats = [
    {
      name: 'Total Users',
      value: '2',
      icon: Users,
      gradient: 'from-primary-500 to-primary-600',
      bgGradient: 'from-primary-50 to-primary-100',
      description: 'Active users in system',
    },
    {
      name: 'Total BOMs',
      value: boms.length.toString(),
      icon: Activity,
      gradient: 'from-secondary-500 to-secondary-600',
      bgGradient: 'from-secondary-50 to-secondary-100',
      description: 'Bill of Materials created',
    },
    {
      name: 'Materials',
      value: materials.length.toString(),
      icon: Settings,
      gradient: 'from-accent-500 to-accent-600',
      bgGradient: 'from-accent-50 to-accent-100',
      description: 'Materials in inventory',
    },
    {
      name: 'System Alerts',
      value: '0',
      icon: AlertTriangle,
      gradient: 'from-premium-gold-500 to-premium-gold-600',
      bgGradient: 'from-premium-gold-50 to-premium-gold-100',
      description: 'Active system alerts',
    },
  ];

  const recentActivity = [
    { id: 1, action: 'New BOM created', user: 'Admin User', time: '2 hours ago' },
    { id: 2, action: 'Material updated', user: 'Regular User', time: '5 hours ago' },
    { id: 3, action: 'User registered', user: 'New User', time: '1 day ago' },
    { id: 4, action: 'BOM exported', user: 'Admin User', time: '2 days ago' },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-premium-gold-500 to-premium-gold-600 p-2 rounded-xl shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-slate-500">System administration and management</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gradient-to-r from-premium-gold-50 to-premium-gold-100 px-4 py-2 rounded-xl border border-premium-gold-200">
          <Shield className="h-5 w-5 text-premium-gold-600" />
          <span className="text-sm font-medium text-premium-gold-700">Admin Access</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl shadow-premium border border-slate-100 p-6 hover:shadow-premium-lg transition-all duration-300 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
                <p className="mt-2 text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors">
                <div>
                  <p className="font-medium text-slate-900">{activity.action}</p>
                  <p className="text-sm text-slate-500">by {activity.user}</p>
                </div>
                <span className="text-sm text-slate-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-2xl shadow-premium border border-slate-100">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-lg font-semibold text-slate-900">System Overview</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <div>
                <p className="font-medium text-slate-900">Database Status</p>
                <p className="text-sm text-slate-500">Local storage active</p>
              </div>
              <div className="w-3 h-3 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <div>
                <p className="font-medium text-slate-900">Export Functionality</p>
                <p className="text-sm text-slate-500">PDF and Excel generation</p>
              </div>
              <div className="w-3 h-3 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <div>
                <p className="font-medium text-slate-900">Authentication</p>
                <p className="text-sm text-slate-500">Mock authentication system</p>
              </div>
              <div className="w-3 h-3 bg-gradient-to-r from-premium-gold-500 to-premium-gold-600 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <div>
                <p className="font-medium text-slate-900">Total System Value</p>
                <p className="text-sm text-slate-500">Combined BOM value</p>
              </div>
              <p className="font-bold bg-gradient-to-r from-premium-gold-500 to-premium-gold-600 bg-clip-text text-transparent">
                {formatCurrency(boms.reduce((sum, bom) => sum + bom.grandTotal, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 p-2 rounded-lg">
            <Sparkles className="h-5 w-5 text-accent-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-6 border border-slate-200 rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-white group">
            <Users className="h-5 w-5 text-primary-600 mr-4 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-medium text-slate-900">Manage Users</p>
              <p className="text-sm text-slate-500">Add or remove users</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </button>
          
          <button className="flex items-center p-6 border border-slate-200 rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-white group">
            <Settings className="h-5 w-5 text-secondary-600 mr-4 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-medium text-slate-900">System Settings</p>
              <p className="text-sm text-slate-500">Configure system</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </button>
          
          <button className="flex items-center p-6 border border-slate-200 rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-white group">
            <Activity className="h-5 w-5 text-accent-600 mr-4 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-medium text-slate-900">View Logs</p>
              <p className="text-sm text-slate-500">System activity logs</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;