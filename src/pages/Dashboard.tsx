import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Package, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  Calculator,
  BarChart3,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import useBOMStore from '../stores/bomStore';
import { formatCurrency } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { boms, materials } = useBOMStore();

  const stats = [
    {
      name: 'Total BOMs',
      value: boms.length,
      icon: FileText,
      gradient: 'from-primary-500 to-primary-600',
      bgGradient: 'from-primary-50 to-primary-100',
      link: '/boms',
    },
    {
      name: 'Materials',
      value: materials.length,
      icon: Package,
      gradient: 'from-secondary-500 to-secondary-600',
      bgGradient: 'from-secondary-50 to-secondary-100',
      link: '/materials',
    },
    {
      name: 'Active Projects',
      value: boms.filter((b) => b.status === 'active').length,
      icon: TrendingUp,
      gradient: 'from-accent-500 to-accent-600',
      bgGradient: 'from-accent-50 to-accent-100',
      link: '/boms',
    },
    {
      name: 'Total Value',
      value: formatCurrency(
        boms.reduce((sum, bom) => sum + bom.grandTotal, 0)
      ),
      icon: DollarSign,
      gradient: 'from-premium-gold-500 to-premium-gold-600',
      bgGradient: 'from-premium-gold-50 to-premium-gold-100',
      link: '/reports',
    },
  ];

  const recentBOMs = boms.slice(-5).reverse();

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="mt-1 text-slate-500">Welcome to your premium BOM Calculator</p>
            </div>
          </div>
        </div>
        <Link
          to="/calculator"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          New BOM
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="group bg-white rounded-2xl shadow-premium p-6 hover:shadow-premium-lg transition-all duration-300 card-hover border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
              <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent BOMs */}
      <div className="bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent BOMs</h2>
          <Link
            to="/boms"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center group transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentBOMs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-slate-500 mb-4">No BOMs created yet</p>
              <Link
                to="/calculator"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md"
              >
                Create your first BOM
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          ) : (
            recentBOMs.map((bom) => (
              <Link
                key={bom.id}
                to={`/calculator`}
                className="px-6 py-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white flex items-center justify-between transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">{bom.name}</p>
                    <p className="text-sm text-slate-500">{bom.projectCode || 'No project code'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(bom.grandTotal)}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(bom.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/calculator"
          className="group bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-1 card-hover relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <Calculator className="h-10 w-10 mb-4 relative z-10" />
          <h3 className="text-xl font-semibold mb-2 relative z-10">Create BOM</h3>
          <p className="text-primary-100 text-sm relative z-10">Calculate material and labor costs for your projects</p>
          <ArrowUpRight className="absolute bottom-4 right-4 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
        </Link>
        
        <Link
          to="/materials"
          className="group bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-8 text-white hover:from-secondary-600 hover:to-secondary-700 transition-all duration-300 shadow-lg shadow-secondary-500/25 hover:shadow-xl hover:shadow-secondary-500/30 hover:-translate-y-1 card-hover relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <Package className="h-10 w-10 mb-4 relative z-10" />
          <h3 className="text-xl font-semibold mb-2 relative z-10">Manage Materials</h3>
          <p className="text-secondary-100 text-sm relative z-10">Add and organize your material inventory</p>
          <ArrowUpRight className="absolute bottom-4 right-4 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
        </Link>
        
        <Link
          to="/reports"
          className="group bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-8 text-white hover:from-accent-600 hover:to-accent-700 transition-all duration-300 shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30 hover:-translate-y-1 card-hover relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <BarChart3 className="h-10 w-10 mb-4 relative z-10" />
          <h3 className="text-xl font-semibold mb-2 relative z-10">View Reports</h3>
          <p className="text-accent-100 text-sm relative z-10">Analyze costs and generate reports</p>
          <ArrowUpRight className="absolute bottom-4 right-4 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;