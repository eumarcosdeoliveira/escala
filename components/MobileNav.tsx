"use client";

import { Calendar, Clock, Users, BarChart3 } from "lucide-react";

type TabType = "escala" | "cobertura" | "pessoas" | "relatorio";

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  gapsCount: number;
}

export function MobileNav({ activeTab, onTabChange, gapsCount }: MobileNavProps) {
  const tabs = [
    { id: "escala" as TabType, label: "Escala", icon: Calendar },
    { id: "cobertura" as TabType, label: "24h", icon: Clock},
    { id: "pessoas" as TabType, label: "Pessoas", icon: Users },
    { id: "relatorio" as TabType, label: "Resumo", icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-4 min-w-[70px] relative transition-colors ${
                isActive ? "text-primary" : "text-gray-400"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                {tab.id === "cobertura" && gapsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                    {gapsCount}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? "font-medium" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
