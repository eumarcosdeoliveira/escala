"use client";

import { Clock, MoreVertical, Check, ArrowLeftRight, Trash2, AlertTriangle, LogOut, Timer } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Acompanhante, Turno } from "@/lib/types";
import { useState, useEffect } from "react";

interface MobileTurnoCardProps {
  turno: Turno;
  acompanhante: Acompanhante;
  acompanhantes?: Acompanhante[];
  onDelete?: (id: number) => void;
  onCheckin?: (id: number, hora: string) => void;
  onCheckout?: (id: number, hora: string) => void;
  onTrocar?: (id: number, novoAcompanhanteId: number) => void;
}

export function MobileTurnoCard({
  turno,
  acompanhante,
  acompanhantes = [],
  onDelete,
  onCheckin,
  onCheckout,
  onTrocar,
}: MobileTurnoCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showTrocarSheet, setShowTrocarSheet] = useState(false);
  const [selectedAcompanhante, setSelectedAcompanhante] = useState("");
  const [tempoAtivo, setTempoAtivo] = useState("");

  const periodoLabel = {
    manha: "Manha",
    tarde: "Tarde",
    noite: "Noite",
    madrugada: "Madrugada",
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  };

  // Calcula o tempo ativo desde o checkin
  const calcularTempoAtivo = () => {
    if (!turno.checkinHora || turno.checkoutHora) return "";

    const [checkinHour, checkinMin] = turno.checkinHora.split(":").map(Number);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentSec = now.getSeconds();

    let diffMinutes = (currentHour * 60 + currentMin) - (checkinHour * 60 + checkinMin);
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Passou da meia-noite

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    const seconds = currentSec;

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
    }
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  };

  // Atualiza o contador a cada segundo
  useEffect(() => {
    if (turno.checkinHora && !turno.checkoutHora) {
      setTempoAtivo(calcularTempoAtivo());
      const interval = setInterval(() => {
        setTempoAtivo(calcularTempoAtivo());
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTempoAtivo("");
    }
  }, [turno.checkinHora, turno.checkoutHora]);

  const handleCheckin = () => {
    if (onCheckin) {
      onCheckin(turno.id, getCurrentTime());
    }
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout(turno.id, getCurrentTime());
    }
  };

  const handleTrocar = () => {
    if (onTrocar && selectedAcompanhante) {
      onTrocar(turno.id, parseInt(selectedAcompanhante));
      setShowTrocarSheet(false);
      setSelectedAcompanhante("");
    }
  };

  const hasCheckin = !!turno.checkinHora;
  const hasCheckout = !!turno.checkoutHora;

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        style={{ borderLeftWidth: 4, borderLeftColor: acompanhante.cor }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {acompanhante.avatar && (
                  <AvatarImage src={acompanhante.avatar} />
                )}
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

          {/* Status de checkin/checkout e contador */}
          {(hasCheckin || hasCheckout) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {hasCheckin && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <Check className="h-3 w-3" />
                  Entrada: {turno.checkinHora}
                </div>
              )}
              {hasCheckout && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  <LogOut className="h-3 w-3" />
                  Saida: {turno.checkoutHora}
                </div>
              )}
            </div>
          )}

          {/* Contador em tempo real */}
          {hasCheckin && !hasCheckout && tempoAtivo && (
            <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <Timer className="h-4 w-4 animate-pulse" />
                  <span className="text-xs font-medium">Tempo ativo</span>
                </div>
                <div className="text-lg font-bold text-green-700 font-mono">
                  {tempoAtivo}
                </div>
              </div>
            </div>
          )}

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
            {!hasCheckin ? (
              <button
                onClick={handleCheckin}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                Check-in
              </button>
            ) : !hasCheckout ? (
              <button
                onClick={handleCheckout}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Check-out
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg">
                <Check className="h-3.5 w-3.5" />
                Concluido
              </div>
            )}
            <button
              onClick={() => setShowTrocarSheet(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
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

      {/* Sheet para trocar acompanhante */}
      <Sheet open={showTrocarSheet} onOpenChange={setShowTrocarSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Trocar Acompanhante</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4 pb-8">
            <p className="text-sm text-gray-500">
              Selecione quem vai substituir <strong>{acompanhante.nome}</strong> neste turno.
            </p>
            <Select
              value={selectedAcompanhante}
              onValueChange={setSelectedAcompanhante}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione o acompanhante..." />
              </SelectTrigger>
              <SelectContent>
                {acompanhantes
                  .filter((a) => a.id !== acompanhante.id)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {a.avatar && <AvatarImage src={a.avatar} />}
                          <AvatarFallback
                            style={{ backgroundColor: a.cor }}
                            className="text-white text-xs"
                          >
                            {a.nome.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {a.nome}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleTrocar}
              className="w-full h-12"
              disabled={!selectedAcompanhante}
            >
              Confirmar Troca
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
