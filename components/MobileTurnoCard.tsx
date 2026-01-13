"use client";

import { Clock, MoreVertical, Check, ArrowLeftRight, Trash2, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Acompanhante, Turno } from "@/lib/types";
import { useState } from "react";

interface MobileTurnoCardProps {
  turno: Turno;
  acompanhante: Acompanhante;
  onDelete?: (id: number) => void;
}

export function MobileTurnoCard({ turno, acompanhante, onDelete }: MobileTurnoCardProps) {
  const [showActions, setShowActions] = useState(false);

  const periodoLabel = {
    manha: "Manha",
    tarde: "Tarde",
    noite: "Noite",
    madrugada: "Madrugada",
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: acompanhante.cor }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback
                style={{ backgroundColor: acompanhante.cor }}
                className="text-white text-base font-semibold"
              >
                {acompanhante.nome.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-gray-900">{acompanhante.nome}</h4>
              <p className="text-sm text-gray-500">{periodoLabel[turno.periodo]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <Clock className="h-3.5 w-3.5" />
                {turno.horaInicio}
              </div>
              <div className="text-sm text-gray-400">{turno.horaFim}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Observacoes e Pontos de Atencao */}
        {(turno.observacao || turno.pontosAtencao) && (
          <div className="mt-3 space-y-2">
            {turno.observacao && (
              <p className="text-sm text-gray-500 italic">
                "{turno.observacao}"
              </p>
            )}
            {turno.pontosAtencao && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  {turno.pontosAtencao}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
            <Check className="h-3.5 w-3.5" />
            Check-in
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Trocar
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(turno.id)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
