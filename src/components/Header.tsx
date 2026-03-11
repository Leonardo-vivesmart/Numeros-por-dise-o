import { HelpCircle, Download, Trash2, Settings } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../utils';

export function Header({ onExport, onClear }: { onExport: () => void; onClear: () => void }) {
  const { state, updateCompanyInfo } = useAppStore();

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ND</span>
            </div>
            <h1 className="text-lg font-semibold text-zinc-900 hidden sm:block">
              Números por Diseño <span className="text-zinc-500 font-normal">Ventas Edition</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-md border border-zinc-200">
            <input
              type="text"
              placeholder="Nombre de tu empresa"
              className="bg-transparent border-none outline-none text-sm font-medium text-zinc-900 placeholder:text-zinc-400 w-32 sm:w-48"
              value={state.companyInfo.name}
              onChange={(e) => updateCompanyInfo({ name: e.target.value })}
            />
            <div className="h-4 w-px bg-zinc-300 mx-1" />
            <select
              className="bg-transparent border-none outline-none text-sm font-medium text-zinc-900 cursor-pointer"
              value={state.companyInfo.currency}
              onChange={(e) => updateCompanyInfo({ currency: e.target.value as any })}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="MXN">MXN</option>
              <option value="COP">COP</option>
              <option value="PEN">PEN</option>
              <option value="CLP">CLP</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Guía de uso: Ingresa tus ventas mensuales en la tabla. El sistema calculará automáticamente proyecciones y crecimiento. Define tus metas PyF, MPyF y SPyF para ver tu progreso.')}
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
              title="Ayuda"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={onClear}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Borrar todos los datos"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
