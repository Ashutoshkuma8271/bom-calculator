import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Package, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  Sparkles,
  Flame,
  Snowflake,
  ChevronRight,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import useBOMStore from '../stores/bomStore';
import { formatCurrency } from '../lib/utils';
import { exportToPDF } from '../lib/export';
import { useThemeStore } from '../stores/themeStore';
import { getProductImage, AKIRA_PRODUCT_IMAGES } from '../lib/productImages';
import ImageWithFallback from '../components/ImageWithFallback';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 340 } },
};

const Dashboard: React.FC = () => {
  const { boms, materials, setCurrentBOM, duplicateBOM, currency } = useBOMStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const { totalValue, totalMaterialCost, totalLaborCost, totalOverhead, totalProfit, activeBOMsCount, avgMargin } = useMemo(() => {
    const totalVal = boms.reduce((sum, bom) => sum + bom.grandTotal, 0);
    const totalMat = boms.reduce((sum, bom) => sum + bom.totalMaterialCost, 0);
    const totalLab = boms.reduce((sum, bom) => sum + bom.totalLaborCost, 0);
    const totalOv = boms.reduce((sum, b) => sum + b.totalOverhead, 0);
    const totalProf = boms.reduce((sum, b) => sum + b.totalProfit, 0);
    const activeCount = boms.filter((b) => b.status === 'active').length;
    const margin = boms.length > 0
      ? (boms.reduce((sum, b) => sum + (b.profitMargin || 0), 0) / boms.length).toFixed(1)
      : '0';

    return {
      totalValue: totalVal,
      totalMaterialCost: totalMat,
      totalLaborCost: totalLab,
      totalOverhead: totalOv,
      totalProfit: totalProf,
      activeBOMsCount: activeCount,
      avgMargin: margin,
    };
  }, [boms]);

  const stats = useMemo(() => [
    {
      name: 'Total Pipeline Value',
      value: formatCurrency(totalValue, currency),
      subtext: `${boms.length} Production Batches`,
      icon: DollarSign,
      color: 'emerald',
      iconBg: 'bg-emerald-600 dark:bg-emerald-500 text-white',
      link: '/reports',
    },
    {
      name: 'Active Cold Chain BOMs',
      value: activeBOMsCount.toString(),
      subtext: 'In active manufacturing & packing',
      icon: Snowflake,
      color: 'cyan',
      iconBg: 'bg-cyan-600 dark:bg-cyan-500 text-white',
      link: '/boms',
    },
    {
      name: 'Materials in Stock',
      value: materials.length.toString(),
      subtext: 'Meats, spices, packaging & dry ice',
      icon: Package,
      color: 'blue',
      iconBg: 'bg-blue-600 dark:bg-blue-500 text-white',
      link: '/materials',
    },
    {
      name: 'Average Profit Margin',
      value: `${avgMargin}%`,
      subtext: 'Target markup maintained',
      icon: TrendingUp,
      color: 'amber',
      iconBg: 'bg-amber-500 dark:bg-amber-400 text-white dark:text-slate-950',
      link: '/reports',
    },
  ], [totalValue, currency, boms.length, activeBOMsCount, materials.length, avgMargin]);

  // Memoized Chart data for cost comparison
  const costDistributionData = useMemo(() => [
    { name: 'Raw Ingredients & Meats', value: totalMaterialCost, color: '#059669' },
    { name: 'Labor & Processing', value: totalLaborCost, color: '#0ea5e9' },
    { name: 'Overhead & Cold Chain', value: totalOverhead, color: '#f59e0b' },
    { name: 'Net Profit Margin', value: totalProfit, color: '#10b981' },
  ], [totalMaterialCost, totalLaborCost, totalOverhead, totalProfit]);

  // Memoized Batch trends
  const batchTrendData = useMemo(() => boms.map((b) => ({
    name: b.name.length > 20 ? b.name.substring(0, 18) + '...' : b.name,
    total: b.grandTotal,
    materials: b.totalMaterialCost,
    labor: b.totalLaborCost,
  })), [boms]);

  const quickTemplates = [
    {
      title: 'Chicken Cheese Momos',
      category: 'Food & Ready-to-Cook',
      yield: '5,000 Pcs (500 Boxes)',
      code: 'AF-MOM-001',
      image: AKIRA_PRODUCT_IMAGES[0].url,
      tag: 'Ready-to-Cook',
      temp: '-18°C Frozen',
      desc: 'Antibiotic-free chicken breast, molten cheese blend, artisan wrappers & blast freezing.',
      action: () => {
        const momoBOM = boms.find(b => b.projectCode === 'AF-MOM-001') || boms[0];
        if (momoBOM) {
          duplicateBOM(momoBOM.id);
          navigate('/boms');
        } else {
          navigate('/calculator');
        }
      }
    },
    {
      title: 'Royal Mutton Seekh Kebab',
      category: 'Food & Ready-to-Cook',
      yield: '1,000 Packs (4k Skewers)',
      code: 'AF-KEB-002',
      image: AKIRA_PRODUCT_IMAGES[1].url,
      tag: 'Gourmet Kebabs',
      temp: '-18°C Frozen',
      desc: 'Himalayan mutton mince, Kashmiri saffron spice blend & flash char grill.',
      action: () => {
        const kebabBOM = boms.find(b => b.projectCode === 'AF-KEB-002') || boms[0];
        if (kebabBOM) {
          duplicateBOM(kebabBOM.id);
          navigate('/boms');
        } else {
          navigate('/calculator');
        }
      }
    },
    {
      title: 'Smoky Chicken Tikka',
      category: 'Food & Ready-to-Cook',
      yield: '800 Packs (320kg)',
      code: 'AF-TIK-003',
      image: AKIRA_PRODUCT_IMAGES[2].url,
      tag: 'Tandoori Special',
      temp: '-18°C Frozen',
      desc: 'Tender chicken breast cubes marinated with Kashmiri chili & cold-pressed mustard oil.',
      action: () => {
        const tikkaBOM = boms.find(b => b.projectCode === 'AF-TIK-003') || boms[0];
        if (tikkaBOM) {
          duplicateBOM(tikkaBOM.id);
          navigate('/boms');
        } else {
          navigate('/calculator');
        }
      }
    },
    {
      title: 'Crispy Chicken Patty',
      category: 'Food & Ready-to-Cook',
      yield: '1,200 Packs (4.8k Pcs)',
      code: 'AF-PAT-004',
      image: AKIRA_PRODUCT_IMAGES[3].url,
      tag: 'Breaded & Pre-fried',
      temp: '-18°C Frozen',
      desc: 'Japanese panko crunchy needle coating over juicy seasoned chicken mince patty.',
      action: () => {
        const pattyBOM = boms.find(b => b.projectCode === 'AF-PAT-004') || boms[0];
        if (pattyBOM) {
          duplicateBOM(pattyBOM.id);
          navigate('/boms');
        } else {
          navigate('/calculator');
        }
      }
    },
  ];

  const tooltipBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltipText = theme === 'dark' ? '#f8fafc' : '#0f172a';

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-7 pb-12"
    >
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 dark:from-emerald-950/90 dark:via-slate-900 dark:to-black text-white p-6 sm:p-8 shadow-xl border border-emerald-800/40"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-700/50 dark:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
              <Flame className="h-3.5 w-3.5 text-emerald-300" />
              <span>Akira Fresh Food Manufacturing & Cost Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
              BOM Costing & Yield Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/85 dark:text-emerald-200/80 max-w-2xl leading-relaxed">
              Calculate exact ingredient costs, labor, blast-freezing overheads, cold-chain packaging, and profit margins for ready-to-cook gourmet products.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/boms"
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>Browse All BOMs</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/calculator"
                onClick={() => setCurrentBOM(null)}
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/30 transition-all"
              >
                <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
                <span>New Recipe BOM</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat) => (
          <motion.div
            key={stat.name}
            variants={itemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            <Link
              to={stat.link}
              className="fresh-card p-5 group flex flex-col justify-between h-full block"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{stat.name}</p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight font-display">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-2xl shadow-xs ${stat.iconBg} group-hover:scale-105 transition-transform`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">{stat.subtext}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Launch Akira Fresh Recipe Presets */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Akira Signature Ready-to-Cook Presets</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">1-Click clone recipes with pre-configured ingredient yields, meats, spices & blast-freezing operations.</p>
          </div>
          <Link to="/calculator" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            <span>Custom Calculator</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickTemplates.map((template) => (
            <motion.div
              key={template.code}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={template.action}
              className="fresh-card overflow-hidden cursor-pointer hover:border-emerald-500/50 dark:hover:border-emerald-500/70 group flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
            >
              <div>
                {/* Product Photo with Badges */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <ImageWithFallback
                    src={template.image}
                    alt={template.title}
                    fallbackCategory={template.tag}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600/90 text-white backdrop-blur-sm tracking-wide">
                      {template.tag}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-200 border border-cyan-400/30 backdrop-blur-sm flex items-center gap-1">
                      <Snowflake className="h-2.5 w-2.5" />
                      {template.temp}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="text-xs font-mono font-bold tracking-tight text-emerald-300 drop-shadow">
                      {template.code}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white">
                      {template.yield}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {template.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {template.desc}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Load into BOM Engine
                </span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Visual Analytics & Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Structure Pie */}
        <motion.div variants={itemVariants} className="fresh-card p-5 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Total Spend Distribution</h3>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">All Active BOMs</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Breakdown between ingredients, labor, logistics, & margins.</p>
            
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {costDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val), currency), 'Amount']}
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      borderColor: tooltipBorder, 
                      color: tooltipText, 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {costDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(item.value, currency)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Batch Cost Comparison Chart */}
        <motion.div variants={itemVariants} className="fresh-card p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Production Batch Value Comparison</h3>
              <Link to="/reports" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                View Full Reports →
              </Link>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Total manufacturing value per BOM configuration.</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={batchTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val), currency), 'Value']}
                    contentStyle={{ 
                      backgroundColor: tooltipBg, 
                      borderColor: tooltipBorder, 
                      color: tooltipText, 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#totalColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Real-time calculations updated automatically with inventory prices.
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">Total: {boms.length} BOMs</span>
          </div>
        </motion.div>
      </div>

      {/* Recent BOMs Table */}
      <motion.div variants={itemVariants} className="fresh-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-display">Recent Recipe & Manufacturing BOMs</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active bill of materials with unit economics and suggested wholesale prices.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/boms"
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              <span>View All ({boms.length})</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {boms.slice(0, 5).map((bom) => {
            const itemImage = bom.imageUrl || getProductImage(bom);
            return (
              <div
                key={bom.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start sm:items-center gap-3.5 max-w-xl">
                  {/* Thumbnail Image */}
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                    <ImageWithFallback
                      src={itemImage}
                      alt={bom.name}
                      fallbackCategory={bom.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                        {bom.projectCode || 'BOM'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        v{bom.version}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        bom.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : bom.status === 'draft'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {bom.status}
                      </span>
                      {bom.storageCondition && (
                        <span className="text-[10px] text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-800/60 px-1.5 py-0.5 rounded-md font-semibold">
                          {bom.storageCondition}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {bom.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {bom.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pl-17 sm:pl-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Batch Grand Total</p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                      {formatCurrency(bom.grandTotal, currency)}
                    </p>
                    {bom.costPerUnit && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                        {formatCurrency(bom.costPerUnit, currency)} / unit
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCurrentBOM(bom);
                        navigate('/calculator');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => duplicateBOM(bom.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Duplicate BOM"
                    >
                      <Copy className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => exportToPDF(bom, { format: 'pdf', includeCosts: true, includeLabor: true, includeSummary: true })}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                      title="Export PDF"
                    >
                      <Download className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
