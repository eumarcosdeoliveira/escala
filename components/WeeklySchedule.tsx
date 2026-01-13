"use client";

import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { Acompanhante, Turno, Gap } from "@/lib/types";

interface WeeklyScheduleProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  acompanhantes: Acompanhante[];
  turnos: Turno[];
  gaps: Map<string, Gap[]>;
}

const PERIODOS = [
  { id: "manha", nome: "Manha", horaInicio: "07:00", horaFim: "12:00" },
  { id: "tarde", nome: "Tarde", horaInicio: "13:00", horaFim: "18:00" },
  { id: "noite", nome: "Noite", horaInicio: "18:00", horaFim: "00:00" },
  { id: "madrugada", nome: "Madrugada", horaInicio: "00:00", horaFim: "07:00" },
];

export function WeeklySchedule({
  currentDate,
  selectedDate,
  onSelectDate,
  acompanhantes,
  turnos,
  gaps,
}: WeeklyScheduleProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)); // Segunda a Sexta

  const getAcompanhante = (id: number) =>
    acompanhantes.find((a) => a.id === id);

  const getTurnosPorDiaEPeriodo = (date: Date, periodoId: string) => {
    const dataStr = format(date, "yyyy-MM-dd");
    return turnos.filter((t) => t.data === dataStr && t.periodo === periodoId);
  };

  const getGapsPorDia = (date: Date) => {
    const dataStr = format(date, "yyyy-MM-dd");
    return gaps.get(dataStr) || [];
  };

  const temGapNoPeriodo = (date: Date, periodoId: string) => {
    const gapsDoDia = getGapsPorDia(date);
    return gapsDoDia.some((g) => g.periodo === periodoId);
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="w-32 p-4 text-left text-sm font-medium text-gray-500 border-b border-gray-200">
              Periodo
            </th>
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const dayName = format(day, "EEEE", { locale: ptBR });
              const gapsDoDia = getGapsPorDia(day);
              const temGaps = gapsDoDia.length > 0;

              return (
                <th
                  key={day.toISOString()}
                  onClick={() => onSelectDate(day)}
                  className={`p-4 text-center border-b border-gray-200 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/10"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {dayName}
                    </span>
                    {temGaps && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {PERIODOS.map((periodo) => (
            <tr key={periodo.id} className="border-b border-gray-100">
              <td className="p-4 bg-gray-50">
                <div className="font-medium text-gray-900">{periodo.nome}</div>
                <div className="text-xs text-gray-500">
                  {periodo.horaInicio} / {periodo.horaFim}
                </div>
              </td>
              {weekDays.map((day) => {
                const turnosDoPeriodo = getTurnosPorDiaEPeriodo(day, periodo.id);
                const isSelected = isSameDay(day, selectedDate);
                const temGap = temGapNoPeriodo(day, periodo.id);

                return (
                  <td
                    key={`${day.toISOString()}-${periodo.id}`}
                    onClick={() => onSelectDate(day)}
                    className={`p-2 align-top border-l border-gray-100 cursor-pointer transition-colors min-h-[100px] ${
                      isSelected ? "bg-primary/5" : "hover:bg-gray-50"
                    } ${temGap ? "bg-red-50" : ""}`}
                  >
                    {turnosDoPeriodo.length === 0 ? (
                      <div className="flex items-center justify-center h-full min-h-[80px]">
                        {temGap ? (
                          <div className="text-center">
                            <AlertTriangle className="h-5 w-5 text-red-400 mx-auto mb-1" />
                            <span className="text-xs text-red-500 font-medium">
                              Sem cobertura
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {turnosDoPeriodo.map((turno) => {
                          const acompanhante = getAcompanhante(
                            turno.acompanhanteId
                          );
                          if (!acompanhante) return null;

                          return (
                            <div
                              key={turno.id}
                              className="px-2 py-1 rounded text-xs font-medium text-center transition-transform hover:scale-105"
                              style={{
                                backgroundColor: `${acompanhante.cor}20`,
                                color: acompanhante.cor,
                                borderLeft: `3px solid ${acompanhante.cor}`,
                              }}
                            >
                              {acompanhante.nome}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legenda de gaps */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Legenda de Cobertura 24h
        </h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
            <span className="text-xs text-gray-600">Turno coberto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
            <span className="text-xs text-gray-600">Sem cobertura</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-gray-600">Dia com gaps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
