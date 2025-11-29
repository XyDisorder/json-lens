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
    <div className="flex gap-4 border-b border-white/10">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            className={`relative pb-3 text-sm font-medium transition-colors ${
              isActive ? "text-white" : "text-slate-400 hover:text-white"
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            <span
              className="absolute left-0 bottom-0 h-0.5 rounded-full bg-emerald-300 transition-all duration-300"
              style={{ width: isActive ? "100%" : "0%" }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
