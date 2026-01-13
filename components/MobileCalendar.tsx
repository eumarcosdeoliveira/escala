"use client";

import { format, addDays, startOfWeek, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MobileCalendarProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function MobileCalendar({
  currentDate,
  selectedDate,
  onSelectDate,
}: MobileCalendarProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="bg-primary px-4 py-3">
      <div className="flex justify-between">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const dayName = format(day, "EEE", { locale: ptBR });
          const dayNumber = format(day, "d");

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all ${
                isSelected
                  ? "bg-white text-primary"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <span className="text-[10px] uppercase font-medium">
                {dayName}
              </span>
              <span
                className={`text-lg font-bold mt-0.5 ${
                  isTodayDate && !isSelected ? "underline underline-offset-2" : ""
                }`}
              >
                {dayNumber}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
