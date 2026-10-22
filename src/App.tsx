import React, { useState, useEffect } from 'react';
import { NavPage, Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { BackendBanner } from './components/common/BackendBanner';
import { ConnectionModal } from './components/common/ConnectionModal';
import { DashboardOverview } from './components/pages/DashboardOverview';
import { DatasetExplorer } from './components/pages/DatasetExplorer';
import { PreprocessingPage } from './components/pages/PreprocessingPage';
import { DataWarehouseOlap } from './components/pages/DataWarehouseOlap';
import { DataVisualization } from './components/pages/DataVisualization';
import { RegressionPage } from './components/pages/RegressionPage';
import { ClassificationPage } from './components/pages/ClassificationPage';
import { ClusteringPage } from './components/pages/ClusteringPage';
import { AssociationRulesPage } from './components/pages/AssociationRulesPage';
import { ExperimentReportsPage } from './components/pages/ExperimentReportsPage';
import { INITIAL_CONCRETE_DATA } from './data/concreteDataset';
import { BackendStatus, ConcreteDataRow } from './types/concrete';
import { concreteApi } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('overview');
  const [activeData, setActiveData] = useState<ConcreteDataRow[]>(INITIAL_CONCRETE_DATA);
  const [status, setStatus] = useState<BackendStatus>(concreteApi.getStatus());
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Subscribe to backend status updates
  useEffect(() => {
    const unsubscribe = concreteApi.subscribeStatus((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  const handleResetData = () => {
    setActiveData(INITIAL_CONCRETE_DATA);
  };

  const handleUpdateData = (newData: ConcreteDataRow[]) => {
    setActiveData(newData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 font-sans">
      <div className="flex-1 flex w-full relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            currentPage={currentPage}
            onSelectPage={(page) => setCurrentPage(page)}
            status={status}
            onOpenSettings={() => setIsConnectionModalOpen(true)}
            totalRecords={activeData.length}
          />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-72 h-full flex">
              <Sidebar
                currentPage={currentPage}
                onSelectPage={(page) => {
                  setCurrentPage(page);
                  setMobileSidebarOpen(false);
                }}
                status={status}
                onOpenSettings={() => {
                  setIsConnectionModalOpen(true);
                  setMobileSidebarOpen(false);
                }}
                totalRecords={activeData.length}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Bar */}
          <TopNav
            currentPage={currentPage}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            status={status}
            onOpenSettings={() => setIsConnectionModalOpen(true)}
            onSelectPage={(page) => setCurrentPage(page)}
          />

          {/* Backend Connection Status Banner */}
          <BackendBanner
            status={status}
            onOpenSettings={() => setIsConnectionModalOpen(true)}
          />

          {/* Page Viewport */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentPage === 'overview' && (
              <DashboardOverview
                data={activeData}
                onNavigate={(page) => setCurrentPage(page)}
                isDemo={status.isDemo}
                onUpdateData={handleUpdateData}
                onResetData={handleResetData}
              />
            )}

            {currentPage === 'explorer' && (
              <DatasetExplorer
                data={activeData}
                onUpdateData={handleUpdateData}
                onResetData={handleResetData}
                isDemo={status.isDemo}
              />
            )}

            {currentPage === 'preprocessing' && (
              <PreprocessingPage
                data={activeData}
                onApplyProcessedData={handleUpdateData}
                isDemo={status.isDemo}
              />
            )}

            {currentPage === 'olap' && (
              <DataWarehouseOlap
                data={activeData}
                isDemo={status.isDemo}
              />
            )}

            {currentPage === 'visualization' && (
              <DataVisualization
                data={activeData}
                isDemo={status.isDemo}
              />
            )}

            {currentPage === 'regression' && (
              <RegressionPage
                data={activeData}
                isDemo={status.isDemo}
              />
            )}

            {currentPage === 'classification' && (
              <ClassificationPage
                data={activeData}
                isDemo={status.isDemo}
              />
            )}

            {currentPage === 'clustering' && (
              <ClusteringPage
                data={activeData}
                isDemo={status.isDemo}
              />
            )}

            {currentPage === 'association' && (
              <AssociationRulesPage
                data={activeData}
                isDemo={status.isDemo}
              />
            )}

            {currentPage === 'reports' && (
              <ExperimentReportsPage />
            )}
          </main>
        </div>
      </div>

      {/* R Backend Settings Modal */}
      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        status={status}
      />
    </div>
  );
}
