import React, { useState } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { useAppStore } from '../store';
import { cn, formatCurrency, formatPercent, calculateAnnualTotal, calculateMonthlyAverage, calculateYoYGrowth, MONTHS } from '../utils';

export function SalesTable() {
  const { state, updateSalesData, addYear, removeYear } = useAppStore();
  const { years, salesData, companyInfo } = state;

  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearValue, setNewYearValue] = useState('');
  const [yearToDelete, setYearToDelete] = useState<number | null>(null);

  const handleAddYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newYear = parseInt(newYearValue, 10);
    if (newYear > 2000 && newYear < 2100) {
      if (!years.includes(newYear)) {
        addYear(newYear);
      }
      setIsAddingYear(false);
      setNewYearValue('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden relative">
      <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Registro de Ventas Mensuales</h2>
          <p className="text-sm text-zinc-500 mt-1">Ingresa tus ventas para calcular crecimiento y proyecciones automáticamente.</p>
        </div>
        
        {isAddingYear ? (
          <form onSubmit={handleAddYearSubmit} className="flex items-center gap-2">
            <input
              type="number"
              min="2000"
              max="2099"
              placeholder="Ej. 2027"
              className="px-3 py-1.5 border border-zinc-300 rounded-md text-sm w-24 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              value={newYearValue}
              onChange={(e) => setNewYearValue(e.target.value)}
              autoFocus
            />
            <button type="submit" className="p-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-800">
              <Check className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setIsAddingYear(false)} className="p-1.5 bg-zinc-100 text-zinc-600 rounded-md hover:bg-zinc-200">
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingYear(true)}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-100 text-zinc-900 text-sm font-medium rounded-md hover:bg-zinc-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Año
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-32 bg-zinc-50 sticky left-0 z-10">Mes</th>
              {years.map((year) => (
                <th key={year} className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider min-w-[150px]">
                  <div className="flex items-center justify-between">
                    <span>{year}</span>
                    {years.length > 1 && (
                      <button
                        onClick={() => setYearToDelete(year)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                        title={`Eliminar ${year}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {years.slice(1).map((year, index) => (
                <th key={`vs-${years[index]}`} className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider min-w-[120px]">
                  Vs. {years[index]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {MONTHS.map((month, monthIndex) => (
              <tr key={month} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-zinc-900 bg-white sticky left-0 z-10">{month}</td>
                {years.map((year) => {
                  const value = salesData[year]?.[monthIndex];
                  
                  return (
                    <td key={`${year}-${monthIndex}`} className="px-6 py-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                          {companyInfo.currency === 'USD' ? '$' : companyInfo.currency === 'EUR' ? '€' : '$'}
                        </span>
                        <input
                          type="number"
                          className="w-full pl-8 pr-3 py-1.5 bg-transparent border border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-md text-sm text-zinc-900 transition-all outline-none"
                          placeholder="0.00"
                          value={value === null ? '' : value}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseFloat(e.target.value);
                            updateSalesData(year, monthIndex, val);
                          }}
                        />
                      </div>
                    </td>
                  );
                })}
                {years.slice(1).map((year, index) => {
                  const prevYear = years[index];
                  const currentVal = salesData[year]?.[monthIndex];
                  const prevVal = salesData[prevYear]?.[monthIndex];
                  
                  if (currentVal !== null && currentVal !== undefined && prevVal !== null && prevVal !== undefined) {
                    const diff = currentVal - prevVal;
                    const growth = calculateYoYGrowth(currentVal, prevVal);
                    
                    return (
                      <td key={`vs-${prevYear}-${monthIndex}`} className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                            diff > 0 ? "bg-emerald-100 text-emerald-800" : 
                            diff < 0 ? "bg-red-100 text-red-800" : 
                            "bg-zinc-100 text-zinc-800"
                          )}>
                            {diff > 0 ? '+' : ''}{formatCurrency(diff, companyInfo.currency)}
                          </span>
                          {growth !== null && (
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                              growth > 0 ? "bg-emerald-100 text-emerald-800" : 
                              growth < 0 ? "bg-red-100 text-red-800" : 
                              "bg-zinc-100 text-zinc-800"
                            )}>
                              {growth > 0 ? '+' : ''}{formatPercent(growth)}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  }
                  
                  return <td key={`vs-${prevYear}-${monthIndex}`} className="px-6 py-4"><span className="text-zinc-400">-</span></td>;
                })}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-zinc-50 border-t-2 border-zinc-200">
            <tr>
              <td className="px-6 py-4 text-sm font-semibold text-zinc-900 bg-zinc-50 sticky left-0 z-10">Total Anual</td>
              {years.map((year) => {
                const currentTotal = calculateAnnualTotal(salesData[year]);
                return (
                  <td key={`total-${year}`} className="px-6 py-4 text-sm font-semibold text-zinc-900">
                    {formatCurrency(currentTotal, companyInfo.currency)}
                  </td>
                );
              })}
              {years.slice(1).map((year, index) => {
                const prevYear = years[index];
                const currentTotal = calculateAnnualTotal(salesData[year]);
                const prevTotal = calculateAnnualTotal(salesData[prevYear]);
                const diff = currentTotal - prevTotal;
                const growth = calculateYoYGrowth(currentTotal, prevTotal);
                
                return (
                  <td key={`total-vs-${prevYear}`} className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                        diff > 0 ? "bg-emerald-100 text-emerald-800" : 
                        diff < 0 ? "bg-red-100 text-red-800" : 
                        "bg-zinc-100 text-zinc-800"
                      )}>
                        {diff > 0 ? '+' : ''}{formatCurrency(diff, companyInfo.currency)}
                      </span>
                      {growth !== null && (
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          growth > 0 ? "bg-emerald-100 text-emerald-800" : 
                          growth < 0 ? "bg-red-100 text-red-800" : 
                          "bg-zinc-100 text-zinc-800"
                        )}>
                          {growth > 0 ? '+' : ''}{formatPercent(growth)}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-zinc-500 bg-zinc-50 sticky left-0 z-10">Promedio Mensual</td>
              {years.map((year) => (
                <td key={`avg-${year}`} className="px-6 py-4 text-sm font-medium text-zinc-500">
                  {formatCurrency(calculateMonthlyAverage(salesData[year]), companyInfo.currency)}
                </td>
              ))}
              {years.slice(1).map((year, index) => (
                <td key={`avg-vs-${years[index]}`} className="px-6 py-4"></td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {yearToDelete !== null && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white border border-zinc-200 shadow-xl rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">¿Eliminar año {yearToDelete}?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Esta acción eliminará todos los datos de ventas registrados para este año. No se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setYearToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  removeYear(yearToDelete);
                  setYearToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Eliminar Año
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
