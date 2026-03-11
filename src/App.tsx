import { useState } from 'react';
import { Header } from './components/Header';
import { SalesTable } from './components/SalesTable';
import { Goals } from './components/Goals';
import { Dashboard } from './components/Dashboard';
import { ExportModal } from './components/ExportModal';
import { ComparativeSummary } from './components/ComparativeSummary';
import { useAppStore } from './store';

export default function App() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { clearData } = useAppStore();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white pb-20">
      <Header
        onExport={() => setIsExportModalOpen(true)}
        onClear={clearData}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Sección de Metas */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-zinc-900">Sistema de Metas</h2>
            <p className="text-sm text-zinc-500">Define tus objetivos de ventas anuales. El progreso se calcula automáticamente.</p>
          </div>
          <Goals />
        </section>

        {/* Sección de Registro de Ventas */}
        <section>
          <SalesTable />
        </section>

        {/* Resumen Comparativo */}
        <section>
          <ComparativeSummary />
        </section>

        {/* Dashboard Visual */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-zinc-900">Dashboard de Inteligencia</h2>
            <p className="text-sm text-zinc-500">Análisis visual de tu desempeño y proyecciones de cierre.</p>
          </div>
          <Dashboard />
        </section>
      </main>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
