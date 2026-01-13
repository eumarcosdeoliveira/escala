"use client";

import { ChevronLeft, ChevronRight, Menu, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MobileHeaderProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onMenuClick: () => void;
  gapsCount: number;
}

export function MobileHeader({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onMenuClick,
  gapsCount,
}: MobileHeaderProps) {
  const mesAno = format(currentDate, "MMMM yyyy", { locale: ptBR });

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-5 bg-primary rounded-sm" />
            <div className="w-1.5 h-5 bg-primary rounded-sm" />
            <div className="w-1.5 h-5 bg-primary rounded-sm" />
          </div>
          <span className="text-lg font-bold text-gray-800 ml-1">escala</span>
        </div>

        {/* Notification */}
        <div className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          {gapsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {gapsCount}
            </span>
          )}
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousWeek}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-base font-medium text-gray-700 capitalize">
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
    </header>
  );
}
