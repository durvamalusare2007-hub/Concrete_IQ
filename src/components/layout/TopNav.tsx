import React from 'react';
import { Menu, Server, Sparkles, BookOpen } from 'lucide-react';
import { BackendStatus } from '../../types/concrete';
import { NavPage } from './Sidebar';

interface TopNavProps {
  currentPage: NavPage;
  onToggleMobileSidebar: () => void;
  status: BackendStatus;
  onOpenSettings: () => void;
  onSelectPage: (page: NavPage) => void;
}

const PAGE_TITLES: Record<NavPage, { title: string; subtitle: string }> = {
  overview: { title: 'Overview Dashboard', subtitle: 'Concrete compressive strength baseline distribution and formulation parameters' },
  explorer: { title: 'Dataset Explorer', subtitle: 'Detailed data table, column metadata, descriptive statistics & CSV management' },
  preprocessing: { title: 'Data Preprocessing', subtitle: 'Data cleaning, duplicate deduplication, outlier audit, and scaling normalization' },
  olap: { title: 'Data Warehouse & OLAP', subtitle: 'Star schema architecture, dimensional cubes, roll-up, drill-down, slice, dice & pivot' },
  visualization: { title: 'Data Visualization', subtitle: 'Interactive histograms, bivariate scatter plots, quantile boxplots & correlation heatmap' },
  regression: { title: 'Regression Modeling', subtitle: 'Simple & Multiple linear regression, residual diagnostics, and strength prediction calculator' },
  classification: { title: 'Classification Algorithms', subtitle: 'Decision Tree (CART) and Gaussian Naive Bayes grade classifiers' },
  clustering: { title: 'Unsupervised Clustering', subtitle: 'K-Means, Agglomerative Hierarchical clustering, PCA projections, and elbow evaluation' },
  association: { title: 'Association Rules Mining', subtitle: 'Frequent itemsets, Apriori rule extraction, support, confidence, and lift metrics' },
  reports: { title: 'Academic Experiment Reports', subtitle: 'Individual reports for all 9 data mining curriculum lab experiments with verified R code' },
};

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  onToggleMobileSidebar,
  status,
  onOpenSettings,
  onSelectPage,
}) => {
  const currentMeta = PAGE_TITLES[currentPage] || PAGE_TITLES.overview;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile hamburger & Context title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 truncate">
              {currentMeta.title}
            </h1>
            <span className="hidden sm:inline-block text-xs text-slate-400">·</span>
            <span className="hidden lg:inline-block text-xs text-slate-500 truncate">
              {currentMeta.subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectPage('reports')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          Lab Reports
        </button>

        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
            status.isConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
          }`}
        >
          <Server className={`w-3.5 h-3.5 ${status.isConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span className="hidden sm:inline">
            {status.isConnected ? 'Analysis Server: Connected' : 'Analysis Server: Not Connected'}
          </span>
          <span className="sm:hidden">
            {status.isConnected ? 'Analysis: Connected' : 'Analysis: Offline'}
          </span>
          <span className={`w-2 h-2 rounded-full ${status.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </button>
      </div>
    </header>
  );
};
