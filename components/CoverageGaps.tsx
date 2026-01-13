"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Clock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Gap } from "@/lib/types";

interface CoverageGapsProps {
  gaps: Map<string, Gap[]>;
  onFillGap: (data: string, gap: Gap) => void;
}

export function CoverageGaps({ gaps, onFillGap }: CoverageGapsProps) {
  const gapsArray = Array.from(gaps.entries()).filter(
    ([_, gapList]) => gapList.length > 0
  );

  if (gapsArray.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Clock className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800">
          Cobertura Completa!
        </h3>
        <p className="text-sm text-green-600 mt-1">
          Todos os periodos estao cobertos para esta semana.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-red-50 px-4 py-3 border-b border-red-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-red-800">
            Horarios sem Cobertura
          </h3>
        </div>
        <p className="text-sm text-red-600 mt-1">
          Os seguintes periodos precisam de acompanhantes:
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {gapsArray.map(([data, gapList]) => {
          const dataObj = new Date(data + "T00:00:00");
          const dataFormatada = format(dataObj, "EEEE, dd/MM", {
            locale: ptBR,
          });

          return (
            <div key={data} className="p-4">
              <h4 className="font-medium text-gray-900 capitalize mb-3">
                {dataFormatada}
              </h4>
              <div className="grid gap-2">
                {gapList.map((gap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {gap.inicio} - {gap.fim}
                        </div>
                        <div className="text-xs text-gray-500">
                          {gap.duracao.toFixed(1)}h sem cobertura
                          {gap.periodo && ` (${gap.periodo})`}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFillGap(data, gap)}
                      className="border-red-200 text-red-600 hover:bg-red-100"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Preencher
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
