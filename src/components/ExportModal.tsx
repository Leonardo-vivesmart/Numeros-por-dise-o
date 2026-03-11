import { FileText, FileSpreadsheet, X } from 'lucide-react';
import { useAppStore } from '../store';
import { exportToPDF, exportToExcel } from './Export';

export function ExportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state } = useAppStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <h2 className="text-xl font-semibold text-zinc-900">Exportar Reporte</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-500 mb-6">
            Selecciona el formato en el que deseas descargar tu reporte de ventas.
          </p>
          
          <button
            onClick={() => {
              exportToPDF(state);
              onClose();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-200 hover:border-red-200 hover:bg-red-50 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 group-hover:text-red-900">Reporte Ejecutivo PDF</h3>
              <p className="text-sm text-zinc-500 group-hover:text-red-700/70">Documento profesional listo para presentar</p>
            </div>
          </button>

          <button
            onClick={() => {
              exportToExcel(state);
              onClose();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 group-hover:text-emerald-900">Hoja de Cálculo Excel</h3>
              <p className="text-sm text-zinc-500 group-hover:text-emerald-700/70">Datos crudos para análisis profundo</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
