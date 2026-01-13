"use client";

import { ChevronLeft, ChevronRight, Calendar, Clock, Users, BarChart3, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type DesktopTabType = "escala" | "cobertura" | "pessoas" | "relatorio" | "acompanhamento";

interface HeaderProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  activeTab: DesktopTabType;
  onTabChange: (tab: DesktopTabType) => void;
  gapsCount?: number;
}

export function Header({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  activeTab,
  onTabChange,
  gapsCount = 0,
}: HeaderProps) {
  const mesAno = format(currentDate, "MMMM yyyy", { locale: ptBR });

  const tabs = [
    { id: "escala" as DesktopTabType, label: "Escala", icon: Calendar },
    { id: "cobertura" as DesktopTabType, label: "Cobertura 24h", icon: Clock, badge: gapsCount },
    { id: "pessoas" as DesktopTabType, label: "Acompanhantes", icon: Users },
    { id: "relatorio" as DesktopTabType, label: "Resumo", icon: BarChart3 },
    { id: "acompanhamento" as DesktopTabType, label: "Acompanhamento", icon: Activity },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-8 bg-primary rounded-sm" />
            <div className="w-2 h-8 bg-primary rounded-sm" />
            <div className="w-2 h-8 bg-primary rounded-sm" />
          </div>
          <span className="text-2xl font-bold text-gray-800 ml-2">escala</span>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousWeek}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium text-gray-700 capitalize min-w-[150px] text-center">
            {mesAno}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextWeek}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* User icons - decorative */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="w-10 h-10 rounded-full bg-primary" />
          <div className="w-10 h-10 rounded-full bg-primary-600" />
        </div>
      </div>

      {/* Sub header with tabs */}
      <div className="flex items-center px-6 py-2 bg-gray-50 overflow-x-auto">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`min-w-[20px] h-5 flex items-center justify-center text-xs font-bold rounded-full px-1 ${
                    isActive ? "bg-white text-primary" : "bg-red-500 text-white"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
