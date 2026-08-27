import React from 'react';
import { Shield, Users, Settings, Activity, AlertTriangle, Sparkles, ArrowUpRight, CheckCircle2, Flame, Snowflake } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useBOMStore from '../stores/bomStore';
import { formatCurrency } from '../lib/utils';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { boms, materials, currency } = useBOMStore();

  if (user?.role !== 'admin') {
    return (
      <div className="fresh-card p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <Shield className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500">Sign in with an admin role to access enterprise user controls and system auditing.</p>
      </div>
    );
  }

  const adminStats = [
    {
      name: 'System Users',
      value: '3 Team Members',
      icon: Users,
      bg: 'bg-emerald-50 text-emerald-700',
      description: 'Production managers & QA admins',
    },
    {
      name: 'Registered BOMs',
      value: boms.length.toString(),
      icon: Activity,
      bg: 'bg-blue-50 text-blue-700',
      description: 'Active recipe costings',
    },
    {
      name: 'Raw Materials & Packaging',
      value: materials.length.toString(),
      icon: Settings,
      bg: 'bg-cyan-50 text-cyan-700',
      description: 'Sourced ingredients in catalog',
    },
    {
      name: 'Cold-Chain QA Status',
      value: 'All Passed (100%)',
      icon: Snowflake,
      bg: 'bg-amber-50 text-amber-800',
      description: 'Zero temperature threshold breaches',
    },
  ];

  const teamMembers = [
    { name: 'Ashutosh Kumar', email: 'ashukumarfbg8271@gmail.com', role: 'Super Admin', status: 'Active' },
    { name: 'Akira Quality Lead', email: 'qa@akirafresh.in', role: 'QA Inspector', status: 'Active' },
    { name: 'Cold-Chain Logistics Operator', email: 'coldchain@akirafresh.in', role: 'Operator', status: 'Active' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
              Enterprise Admin Control
            </h1>
            <p className="text-xs text-slate-500">Audit logs, user access roles, and facility production authorizations.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <div key={stat.name} className="fresh-card p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400">{stat.name}</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5 font-display">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Team Access Table */}
      <div className="fresh-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Authorized Team Members</h3>
            <p className="text-xs text-slate-500">Staff with permissions to calculate and modify Akira recipe costings.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Access Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMembers.map((member) => (
                <tr key={member.email} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{member.name}</p>
                    <p className="text-[11px] text-slate-500">{member.email}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{member.role}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {member.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 font-medium">Full Access</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
