"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HeaderProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  activeTab: "escalas" | "publicar";
  onTabChange: (tab: "escalas" | "publicar") => void;
}

export function Header({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  activeTab,
  onTabChange,
}: HeaderProps) {
  const mesAno = format(currentDate, "MMMM yyyy", { locale: ptBR });

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

        {/* Navigation circles - decorative */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <div className="w-16 h-1 bg-gray-200 rounded" />
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <div className="w-16 h-1 bg-gray-200 rounded" />
          <div className="w-3 h-3 rounded-full bg-gray-200" />
          <div className="w-16 h-1 bg-gray-200 rounded" />
          <div className="w-3 h-3 rounded-full bg-gray-200" />
        </div>

        {/* User icons - decorative */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="w-10 h-10 rounded-full bg-primary" />
          <div className="w-10 h-10 rounded-full bg-primary-600" />
        </div>
      </div>

      {/* Sub header with tabs and date navigation */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
        <div className="flex items-center gap-4">
          {/* Tabs */}
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => onTabChange("escalas")}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === "escalas"
                  ? "bg-white text-gray-900"
                  : "bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              Escalas
            </button>
            <button
              onClick={() => onTabChange("publicar")}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === "publicar"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
            >
              Publicar
            </button>
          </div>
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

        {/* Decorative circles */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="w-8 h-8 rounded-full bg-gray-200" />
        </div>
      </div>
    </header>
  );
}
