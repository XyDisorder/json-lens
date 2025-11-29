"use client";

import type { FC } from "react";

type TabConfig = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: TabConfig[];
  activeTab: string;
  onChange: (id: string) => void;
};

const Tabs: FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex gap-4 border-b border-gray-200 dark:border-white/10">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            className={`relative pb-3 text-sm font-medium transition-colors ${
              isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white"
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            <span
              className="absolute left-0 bottom-0 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-300 transition-all duration-300"
              style={{ width: isActive ? "100%" : "0%" }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
