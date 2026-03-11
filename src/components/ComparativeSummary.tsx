import { useMemo } from 'react';
import { useAppStore } from '../store';
import { calculateAnnualTotal, calculateYoYGrowth, formatCurrency, formatPercent, MONTHS, calculateMonthlyAverage } from '../utils';
import { Trophy, TrendingUp, AlertCircle, Calendar } from 'lucide-react';

export function ComparativeSummary() {
  const { state } = useAppStore();
  const { years, salesData, companyInfo } = state;

  const summary = useMemo(() => {
    if (years.length === 0) return null;

    const currentYear = years[years.length - 1];
    const previousYear = years.length > 1 ? years[years.length - 2] : null;

    const currentTotal = calculateAnnualTotal(salesData[currentYear]);
    const previousTotal = previousYear ? calculateAnnualTotal(salesData[previousYear]) : 0;

    const comparisons = [];
    for (let i = 1; i < years.length; i++) {
      const currYear = years[i];
      const prevYear = years[i - 1];
      const currTotal = calculateAnnualTotal(salesData[currYear]);
      const prevTotal = calculateAnnualTotal(salesData[prevYear]);
      const growth = calculateYoYGrowth(currTotal, prevTotal);
      const absDiff = currTotal - prevTotal;
      comparisons.push({
        currentYear: currYear,
        previousYear: prevYear,
        growth,
        absDiff,
      });
    }

    // Mejor año histórico
    let bestYear = currentYear;
    let maxTotal = currentTotal;
    let totalHistorico = 0;
    
    years.forEach(year => {
      const total = calculateAnnualTotal(salesData[year]);
      totalHistorico += total;
      if (total > maxTotal) {
        maxTotal = total;
        bestYear = year;
      }
    });

    // Mejor y peor mes del año actual
    let bestMonthIndex = -1;
    let worstMonthIndex = -1;
    let maxMonthVal = -Infinity;
    let minMonthVal = Infinity;

    for (let i = 0; i < 12; i++) {
      const val = salesData[currentYear]?.[i];
      if (val !== null && val !== undefined) {
        if (val > maxMonthVal) {
          maxMonthVal = val;
          bestMonthIndex = i;
        }
        if (val < minMonthVal) {
          minMonthVal = val;
          worstMonthIndex = i;
        }
      }
    }

    // Promedio mensual actual
    const promedioMensualActual = calculateMonthlyAverage(salesData[currentYear]);

    // Crecimiento promedio
    let sumGrowth = 0;
    let validGrowths = 0;
    comparisons.forEach(comp => {
      if (comp.growth !== null) {
        sumGrowth += comp.growth;
        validGrowths++;
      }
    });
    const crecimientoPromedio = validGrowths > 0 ? sumGrowth / validGrowths : null;

    return {
      currentYear,
      currentTotal,
      comparisons,
      bestYear,
      bestMonth: bestMonthIndex >= 0 ? MONTHS[bestMonthIndex] : '-',
      worstMonth: worstMonthIndex >= 0 ? MONTHS[worstMonthIndex] : '-',
      totalHistorico,
      promedioMensualActual,
      crecimientoPromedio,
    };
  }, [years, salesData]);

  if (!summary) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
      <h3 className="text-lg font-semibold text-zinc-900 mb-4">Resumen Comparativo</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total {summary.currentYear}</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">{formatCurrency(summary.currentTotal, companyInfo.currency)}</p>
        </div>

        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Promedio Mensual ({summary.currentYear})</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">{formatCurrency(summary.promedioMensualActual, companyInfo.currency)}</p>
        </div>

        {summary.comparisons.map((comp) => (
          <div key={`${comp.currentYear}-vs-${comp.previousYear}`} className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                {comp.currentYear} Vs. {comp.previousYear}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-lg font-bold ${comp.absDiff > 0 ? 'text-emerald-600' : comp.absDiff < 0 ? 'text-red-600' : 'text-zinc-900'}`}>
                {comp.absDiff > 0 ? '+' : ''}{formatCurrency(comp.absDiff, companyInfo.currency)}
              </p>
              <span className={`text-xs font-medium ${comp.growth && comp.growth > 0 ? 'text-emerald-600' : comp.growth && comp.growth < 0 ? 'text-red-600' : 'text-zinc-500'}`}>
                ({comp.growth !== null ? (comp.growth > 0 ? '+' : '') + formatPercent(comp.growth) : '-'})
              </span>
            </div>
          </div>
        ))}

        {summary.crecimientoPromedio !== null && (
          <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium uppercase tracking-wider">Crecimiento Promedio</span>
            </div>
            <p className={`text-lg font-bold ${summary.crecimientoPromedio > 0 ? 'text-emerald-600' : summary.crecimientoPromedio < 0 ? 'text-red-600' : 'text-zinc-900'}`}>
              {summary.crecimientoPromedio > 0 ? '+' : ''}{formatPercent(summary.crecimientoPromedio)}
            </p>
          </div>
        )}

        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium uppercase tracking-wider">Mejor Año</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">{summary.bestYear}</p>
        </div>

        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Trophy className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium uppercase tracking-wider">Mejor Mes ({summary.currentYear})</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">{summary.bestMonth}</p>
        </div>

        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium uppercase tracking-wider">Peor Mes ({summary.currentYear})</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">{summary.worstMonth}</p>
        </div>

        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Histórico</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">{formatCurrency(summary.totalHistorico, companyInfo.currency)}</p>
        </div>
      </div>
    </div>
  );
}
