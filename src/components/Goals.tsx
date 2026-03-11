import { ReactNode } from 'react';
import { Target, TrendingUp, Zap } from 'lucide-react';
import { useAppStore } from '../store';
import { cn, formatCurrency, calculateAnnualTotal } from '../utils';

export function Goals() {
  const { state, updateGoals } = useAppStore();
  const { goals, companyInfo, years, salesData } = state;

  const currentYear = years[years.length - 1];
  const currentTotal = currentYear ? calculateAnnualTotal(salesData[currentYear]) : 0;

  const handleGoalChange = (key: keyof typeof goals, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(numValue)) return;
    
    updateGoals({ ...goals, [key]: numValue });
  };

  const renderGoalCard = (
    title: string,
    key: keyof typeof goals,
    description: string,
    icon: ReactNode,
    colorClass: string,
    progressColorClass: string
  ) => {
    const goalValue = goals[key];
    const rawProgress = goalValue > 0 ? (currentTotal / goalValue) * 100 : 0;
    const progress = Math.min(100, rawProgress);
    const remaining = Math.max(0, goalValue - currentTotal);

    return (
      <div className={cn("bg-white rounded-xl shadow-sm border p-6 relative overflow-hidden", colorClass)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", progressColorClass.replace('bg-', 'bg-opacity-20 text-'))}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
              <p className="text-xs text-zinc-500 font-medium">{description}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Meta Anual</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">
              {companyInfo.currency}
            </span>
            <input
              type="number"
              className="w-full pl-12 pr-4 py-2 bg-zinc-50 border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-lg text-lg font-semibold text-zinc-900 transition-all outline-none"
              value={goals[key] === 0 ? '' : goals[key]}
              onChange={(e) => handleGoalChange(key, e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-zinc-700">Progreso Actual</span>
            <span className="font-bold text-zinc-900">{rawProgress.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500 ease-out", progressColorClass)}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500 pt-1">
            <span>{formatCurrency(currentTotal, companyInfo.currency)}</span>
            <span>Faltan: {formatCurrency(remaining, companyInfo.currency)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {renderGoalCard(
        'PyF',
        'pyf',
        'Productivo y Feliz (Mínimo)',
        <Target className="w-5 h-5 text-blue-600" />,
        'border-blue-100 hover:border-blue-200',
        'bg-blue-500'
      )}
      {renderGoalCard(
        'MPyF',
        'mpyf',
        'Muy Productivo y Feliz (Recomendado)',
        <TrendingUp className="w-5 h-5 text-emerald-600" />,
        'border-emerald-100 hover:border-emerald-200',
        'bg-emerald-500'
      )}
      {renderGoalCard(
        'SPyF',
        'spyf',
        'Súper Productivo y Feliz (Ambicioso)',
        <Zap className="w-5 h-5 text-purple-600" />,
        'border-purple-100 hover:border-purple-200',
        'bg-purple-500'
      )}
    </div>
  );
}
