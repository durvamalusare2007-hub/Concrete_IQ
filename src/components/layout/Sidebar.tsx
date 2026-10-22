import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TableProperties,
  Sliders,
  Boxes,
  BarChart2,
  TrendingUp,
  GitFork,
  Network,
  FileText,
  Server,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Database,
} from 'lucide-react';
import { BackendStatus } from '../../types/concrete';

export type NavPage =
  | 'overview'
  | 'explorer'
  | 'preprocessing'
  | 'olap'
  | 'visualization'
  | 'regression'
  | 'classification'
  | 'clustering'
  | 'association'
  | 'reports';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  status: BackendStatus;
  onOpenSettings: () => void;
  totalRecords: number;
}

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'management',
    title: 'Data Management',
    items: [
      { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
      { id: 'explorer', label: 'Dataset Explorer', icon: TableProperties },
      { id: 'preprocessing', label: 'Data Preprocessing', icon: Sliders },
    ],
  },
  {
    id: 'analysis',
    title: 'Analysis & Visuals',
    items: [
      { id: 'olap', label: 'Data Warehouse & OLAP', icon: Boxes },
      { id: 'visualization', label: 'Data Visualization', icon: BarChart2 },
    ],
  },
  {
    id: 'models',
    title: 'Data Mining Models',
    items: [
      { id: 'regression', label: 'Regression Modeling', icon: TrendingUp },
      { id: 'classification', label: 'Classification', icon: GitFork },
      { id: 'clustering', label: 'Clustering', icon: Sparkles },
      { id: 'association', label: 'Association Rules', icon: Network },
    ],
  },
  {
    id: 'academic',
    title: 'Academic Reports',
    items: [
      { id: 'reports', label: 'Experiment Reports', icon: FileText, badge: '9 Labs' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  status,
  onOpenSettings,
  totalRecords,
}) => {
  // Collapsible section state; default all open for accessibility, but user can toggle
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Ensure the section containing the active page is always open
  useEffect(() => {
    const activeSection = NAV_SECTIONS.find(sec => sec.items.some(item => item.id === currentPage));
    if (activeSection && collapsedSections[activeSection.id]) {
      setCollapsedSections(prev => ({ ...prev, [activeSection.id]: false }));
    }
  }, [currentPage]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <aside className="w-64 bg-[#091122] text-slate-300 flex flex-col shrink-0 border-r border-slate-800/90 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#060B18]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight font-sans">ConcreteIQ</span>
            </div>
            <p className="text-[10px] text-slate-400">Data Mining Studio</p>
          </div>
        </div>

        <div className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
          R Lab
        </div>
      </div>

      {/* Dataset quick summary pill */}
      <div className="px-4 py-2.5 border-b border-slate-800/60 bg-[#0d1629]/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Active Dataset</span>
        </div>
        <span className="text-teal-300 font-mono font-semibold tabular-nums text-[11px]">
          {totalRecords.toLocaleString()} rows
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3">
        {NAV_SECTIONS.map((section) => {
          const isCollapsed = !!collapsedSections[section.id];
          const hasActiveItem = section.items.some(item => item.id === currentPage);

          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header Button */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors rounded cursor-pointer ${
                  hasActiveItem ? 'text-slate-200' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{section.title}</span>
                <span className="text-slate-500">
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>

              {/* Section Items */}
              {!isCollapsed && (
                <div className="space-y-0.5 pl-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectPage(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ml-1.5 ${
                            isActive 
                              ? 'bg-blue-700 text-white' 
                              : 'bg-slate-800 text-teal-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Compact Server Status Card */}
      <div className="p-3 border-t border-slate-800 bg-[#060B18]">
        <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/90">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300">Analysis Server</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              status.isConnected 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {status.isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mb-2 truncate">
            {status.isConnected ? 'Calculations ready' : 'Sample preview mode'}
          </p>
          <button
            onClick={onOpenSettings}
            className="w-full py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Server className="w-3 h-3 text-teal-400" />
            Server Settings
          </button>
        </div>
      </div>
    </aside>
  );
};
