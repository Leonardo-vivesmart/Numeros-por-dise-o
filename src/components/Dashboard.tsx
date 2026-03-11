import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ComposedChart,
  Area,
  Cell,
} from 'recharts';
import { useAppStore } from '../store';
import { calculateAnnualTotal, calculateProjections, calculateYoYGrowth, formatCurrency, formatPercent, MONTHS } from '../utils';

export function Dashboard() {
  const { state } = useAppStore();
  const { years, salesData, companyInfo, goals } = state;

  const currentYear = years[years.length - 1];
  const previousYear = years[years.length - 2];

  const monthlyData = useMemo(() => {
    return MONTHS.map((month, index) => {
      const dataPoint: any = { name: month.substring(0, 3) };
      years.forEach((year) => {
        dataPoint[year] = salesData[year]?.[index] || 0;
      });
      return dataPoint;
    });
  }, [years, salesData]);

  const annualData = useMemo(() => {
    return years.map((year, index) => {
      const total = calculateAnnualTotal(salesData[year]);
      let growth = 0;
      if (index > 0) {
        const prevTotal = calculateAnnualTotal(salesData[years[index - 1]]);
        growth = calculateYoYGrowth(total, prevTotal) || 0;
      }
      return {
        year: year.toString(),
        total,
        growth: growth * 100, // Convert to percentage for chart
      };
    });
  }, [years, salesData]);

  const projections = useMemo(() => {
    if (!currentYear) return null;
    return calculateProjections(
      salesData[currentYear],
      previousYear ? salesData[previousYear] : undefined
    );
  }, [currentYear, previousYear, salesData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-zinc-200 rounded-lg shadow-lg">
          <p className="font-semibold text-zinc-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const isGrowth = entry.dataKey === 'growth';
            const value = isGrowth ? formatPercent(entry.value / 100) : formatCurrency(entry.value, companyInfo.currency);
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                {entry.name}: {value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Ventas Mensuales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-zinc-900 mb-6">Comparativa Mensual</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(value) => `${companyInfo.currency === 'USD' ? '$' : companyInfo.currency === 'EUR' ? '€' : '$'}${(value / 1000).toFixed(0)}k`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                {years.map((year, index) => (
                  <Line
                    key={year}
                    type="monotone"
                    dataKey={year}
                    name={year.toString()}
                    stroke={index === years.length - 1 ? '#18181b' : index === years.length - 2 ? '#a1a1aa' : '#e4e4e7'}
                    strokeWidth={index === years.length - 1 ? 3 : 2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          {/* Gráfico de Totales Anuales */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900 mb-6">Totales Anuales</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={annualData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} dy={5} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickFormatter={(value) => `${companyInfo.currency === 'USD' ? '$' : companyInfo.currency === 'EUR' ? '€' : '$'}${(value / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                  <Bar dataKey="total" name="Total Ventas" fill="#18181b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Crecimiento Anual */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900 mb-6">Crecimiento Anual</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={annualData.slice(1)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} dy={5} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                  <Bar dataKey="growth" name="Crecimiento" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {annualData.slice(1).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.growth >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Proyecciones */}
      {projections && (
        <div className="bg-zinc-900 text-white rounded-xl shadow-sm p-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Proyección de Cierre {currentYear}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4 border border-white/10 backdrop-blur-sm">
              <p className="text-zinc-400 text-sm font-medium mb-1">Escenario Conservador</p>
              <p className="text-2xl font-bold">{formatCurrency(projections.conservative, companyInfo.currency)}</p>
              <p className="text-xs text-zinc-500 mt-2">Basado en tendencia histórica</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-emerald-500/30 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 bg-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg">
                Más Probable
              </div>
              <p className="text-emerald-300 text-sm font-medium mb-1">Escenario Realista</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(projections.realistic, companyInfo.currency)}</p>
              <p className="text-xs text-emerald-500/70 mt-2">Basado en promedio actual</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/10 backdrop-blur-sm">
              <p className="text-zinc-400 text-sm font-medium mb-1">Escenario Agresivo</p>
              <p className="text-2xl font-bold">{formatCurrency(projections.aggressive, companyInfo.currency)}</p>
              <p className="text-xs text-zinc-500 mt-2">Basado en crecimiento acelerado (+15%)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
