import React from 'react';
import { Shield, Users, Settings, Activity, ArrowUpRight, CheckCircle2, Flame, Snowflake, Award, Lock } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useBOMStore from '../stores/bomStore';
import { formatCurrency } from '../lib/utils';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { boms, materials, currency } = useBOMStore();

  if (user?.role !== 'admin') {
    return (
      <div className="fresh-card p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <Shield className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sign in with an admin role (e.g. ashukumarfbg8271@gmail.com / admin123) to access enterprise user controls and facility auditing.</p>
      </div>
    );
  }

  const adminStats = [
    {
      name: 'System Users',
      value: '3 Team Members',
      icon: Users,
      bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      description: 'Production managers & QA admins',
    },
    {
      name: 'Registered BOMs',
      value: boms.length.toString(),
      icon: Activity,
      bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
      description: 'Active recipe costings in catalog',
    },
    {
      name: 'Raw Materials & Stock',
      value: materials.length.toString(),
      icon: Settings,
      bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
      description: 'Proteins, spices, packaging & cold packs',
    },
    {
      name: 'Cold-Chain QA Status',
      value: '100% Compliant',
      icon: Snowflake,
      bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      description: 'FSSAI Certified blast-freezing standards',
    },
  ];

  const teamMembers = [
    { name: 'Ashutosh Kumar', email: 'ashukumarfbg8271@gmail.com', role: 'Super Admin', status: 'Active', facility: 'Delhi NCR Cold Facility #1' },
    { name: 'Akira Culinary Lead', email: 'culinary@akirafresh.in', role: 'Executive Chef', status: 'Active', facility: 'Recipe Formulation Lab' },
    { name: 'Cold-Chain Logistics Operator', email: 'coldchain@akirafresh.in', role: 'Logistics Lead', status: 'Active', facility: 'Delhi NCR Hub' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-slate-900 dark:bg-emerald-600 text-white shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
                Enterprise Admin & Facility Control
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                FSSAI Certified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Audit logs, facility user access permissions, and cold-chain compliance parameters.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <div key={stat.name} className="fresh-card p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">{stat.name}</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-display">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Team Access Table */}
      <div className="fresh-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Authorized Team Members</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Staff with permissions to calculate and modify Akira recipe costings and inventory.</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl">
            3 Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 sm:px-6">Team Member</th>
                <th className="py-3 px-4">Role & Assigned Facility</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right sm:pr-6">Access Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {teamMembers.map((member) => (
                <tr key={member.email} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6">
                    <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{member.role}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{member.facility}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {member.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right sm:pr-6 text-emerald-600 dark:text-emerald-400 font-bold">
                    Full Admin Access
                  </td>
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
