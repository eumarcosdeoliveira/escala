"use client";

import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, CheckCircle, Clock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Gap } from "@/lib/types";

interface MobileCoberturaViewProps {
  currentDate: Date;
  gaps: Map<string, Gap[]>;
  onFillGap: (data: string, gap: Gap) => void;
}

export function MobileCoberturaView({
  currentDate,
  gaps,
  onFillGap,
}: MobileCoberturaViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dataStr = format(date, "yyyy-MM-dd");
    const gapsDoDia = gaps.get(dataStr) || [];
    return { date, dataStr, gaps: gapsDoDia };
  });

  const totalGaps = Array.from(gaps.values()).flat().length;
  const diasComGaps = weekDays.filter((d) => d.gaps.length > 0).length;
  const diasCompletos = 7 - diasComGaps;

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header stats */}
      <div className="bg-gradient-to-br from-primary to-primary-700 px-4 py-6 text-white">
        <h2 className="text-xl font-bold mb-1">Cobertura 24 Horas</h2>
        <p className="text-sm text-white/80 mb-4">
          Verifique os periodos que precisam de acompanhantes
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{totalGaps}</div>
            <div className="text-xs text-white/80">Gaps</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{diasComGaps}</div>
            <div className="text-xs text-white/80">Dias c/ gaps</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{diasCompletos}</div>
            <div className="text-xs text-white/80">Dias OK</div>
          </div>
        </div>
      </div>

      {/* Gaps list */}
      <div className="flex-1 overflow-auto">
        {totalGaps === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Cobertura Completa!
            </h3>
            <p className="text-sm text-gray-500 text-center">
              Todos os periodos da semana estao cobertos.
              Otimo trabalho da equipe!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {weekDays
              .filter((d) => d.gaps.length > 0)
              .map(({ date, dataStr, gaps: dayGaps }) => (
                <div key={dataStr} className="p-4">
                  {/* Day header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {format(date, "EEEE", { locale: ptBR })}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {format(date, "dd 'de' MMMM", { locale: ptBR })} •{" "}
                        {dayGaps.length} periodo(s) sem cobertura
                      </p>
                    </div>
                  </div>

                  {/* Gaps */}
                  <div className="space-y-2 ml-12">
                    {dayGaps.map((gap, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-red-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {gap.inicio} - {gap.fim}
                            </div>
                            <div className="text-xs text-gray-500">
                              {gap.periodo} • {gap.duracao.toFixed(0)}h
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onFillGap(dataStr, gap)}
                          className="bg-red-500 hover:bg-red-600 text-white h-9"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Preencher
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
