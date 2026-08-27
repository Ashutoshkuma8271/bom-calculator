export const getCurrencyCode = (): string => {
  return localStorage.getItem('akira_currency') || 'INR';
};

export const formatCurrency = (amount: number, currencyCode?: string): string => {
  const currency = currencyCode || getCurrencyCode();
  const locale = currency === 'INR' ? 'en-IN' : currency === 'EUR' ? 'de-DE' : currency === 'GBP' ? 'en-GB' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `₹${(amount || 0).toFixed(2)}`;
  }
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num || 0);
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const calculatePercentage = (value: number, total: number): number => {
  if (!total || total === 0) return 0;
  return (value / total) * 100;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const getCategoryBadgeColor = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'proteins & meats':
    case 'meat & poultry':
    case 'food & ready-to-cook':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'spices & seasonings':
    case 'flavorings':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'dairy & binders':
    case 'bakery & flour':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    case 'packaging & boxes':
    case 'pouches & bags':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'cold chain & logistics':
    case 'dry ice & coolant':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
