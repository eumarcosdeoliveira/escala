"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileCalendar } from "@/components/MobileCalendar";
import { MobileTurnoCard } from "@/components/MobileTurnoCard";
import { Acompanhante, Turno, Gap } from "@/lib/types";

interface MobileEscalaViewProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  acompanhantes: Acompanhante[];
  turnos: Turno[];
  gaps: Map<string, Gap[]>;
  onAddTurno: (turno: Omit<Turno, "id">) => void;
  onDeleteTurno: (id: number) => void;
  onCheckin: (id: number, hora: string) => void;
  onCheckout: (id: number, hora: string) => void;
  onTrocar: (id: number, novoAcompanhanteId: number) => void;
}

const PERIODOS = [
  { id: "manha", nome: "Manha", horaInicio: "07:00", horaFim: "12:00" },
  { id: "tarde", nome: "Tarde", horaInicio: "13:00", horaFim: "18:00" },
  { id: "noite", nome: "Noite", horaInicio: "18:00", horaFim: "00:00" },
  { id: "madrugada", nome: "Madrugada", horaInicio: "00:00", horaFim: "07:00" },
];

export function MobileEscalaView({
  currentDate,
  selectedDate,
  onSelectDate,
  acompanhantes,
  turnos,
  gaps,
  onAddTurno,
  onDeleteTurno,
  onCheckin,
  onCheckout,
  onTrocar,
}: MobileEscalaViewProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [novoTurno, setNovoTurno] = useState({
    acompanhanteId: "",
    periodo: "",
    horaInicio: "",
    horaFim: "",
    observacao: "",
    pontosAtencao: "",
  });

  const dataStr = format(selectedDate, "yyyy-MM-dd");
  const turnosDoDia = turnos.filter((t) => t.data === dataStr);
  const gapsDoDia = gaps.get(dataStr) || [];

  const getAcompanhante = (id: number) => acompanhantes.find((a) => a.id === id);

  const handlePeriodoChange = (periodoId: string) => {
    const periodo = PERIODOS.find((p) => p.id === periodoId);
    if (periodo) {
      setNovoTurno({
        ...novoTurno,
        periodo: periodoId,
        horaInicio: periodo.horaInicio,
        horaFim: periodo.horaFim,
      });
    }
  };

  const handleAddTurno = () => {
    if (novoTurno.acompanhanteId && novoTurno.periodo) {
      onAddTurno({
        acompanhanteId: parseInt(novoTurno.acompanhanteId),
        data: dataStr,
        periodo: novoTurno.periodo as "manha" | "tarde" | "noite" | "madrugada",
        horaInicio: novoTurno.horaInicio,
        horaFim: novoTurno.horaFim,
        observacao: novoTurno.observacao,
        pontosAtencao: novoTurno.pontosAtencao,
      });
      setNovoTurno({
        acompanhanteId: "",
        periodo: "",
        horaInicio: "",
        horaFim: "",
        observacao: "",
        pontosAtencao: "",
      });
      setIsSheetOpen(false);
    }
  };

  // Group turnos by periodo
  const turnosPorPeriodo = PERIODOS.map((periodo) => ({
    periodo,
    turnos: turnosDoDia.filter((t) => t.periodo === periodo.id),
    temGap: gapsDoDia.some((g) => g.periodo === periodo.nome),
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Calendar strip */}
      <MobileCalendar
        currentDate={currentDate}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />

      {/* Selected date header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </h2>
        <p className="text-sm text-gray-500">
          {turnosDoDia.length} turno(s) registrado(s)
          {gapsDoDia.length > 0 && (
            <span className="text-red-500 ml-2">
              • {gapsDoDia.length} periodo(s) sem cobertura
            </span>
          )}
        </p>
      </div>

      {/* Turnos list */}
      <div className="flex-1 overflow-auto pb-24">
        {turnosPorPeriodo.map(({ periodo, turnos: turnosPeriodo, temGap }) => (
          <div key={periodo.id} className="border-b border-gray-100">
            {/* Periodo header */}
            <div
              className={`px-4 py-2 flex items-center justify-between ${
                temGap ? "bg-red-50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${temGap ? "text-red-500" : "text-gray-400"}`} />
                <span className={`text-sm font-medium ${temGap ? "text-red-700" : "text-gray-600"}`}>
                  {periodo.nome}
                </span>
                <span className="text-xs text-gray-400">
                  {periodo.horaInicio} - {periodo.horaFim}
                </span>
              </div>
              {temGap && (
                <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Sem cobertura
                </div>
              )}
            </div>

            {/* Turnos do periodo */}
            <div className="p-4 space-y-3">
              {turnosPeriodo.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400">Nenhum turno neste periodo</p>
                </div>
              ) : (
                turnosPeriodo.map((turno) => {
                  const acompanhante = getAcompanhante(turno.acompanhanteId);
                  if (!acompanhante) return null;

                  return (
                    <MobileTurnoCard
                      key={turno.id}
                      turno={turno}
                      acompanhante={acompanhante}
                      acompanhantes={acompanhantes}
                      onDelete={onDeleteTurno}
                      onCheckin={onCheckin}
                      onCheckout={onCheckout}
                      onTrocar={onTrocar}
                    />
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB - Add turno */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-auto">
          <SheetHeader>
            <SheetTitle>Novo Turno</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6 pb-8">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Quem vai ficar
              </label>
              <Select
                value={novoTurno.acompanhanteId}
                onValueChange={(v) =>
                  setNovoTurno({ ...novoTurno, acompanhanteId: v })
                }
              >
                <SelectTrigger className="mt-1.5 h-12">
                  <SelectValue placeholder="Selecione o acompanhante..." />
                </SelectTrigger>
                <SelectContent>
                  {acompanhantes.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: a.cor }}
                        />
                        {a.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Periodo</label>
              <Select
                value={novoTurno.periodo}
                onValueChange={handlePeriodoChange}
              >
                <SelectTrigger className="mt-1.5 h-12">
                  <SelectValue placeholder="Selecione o periodo..." />
                </SelectTrigger>
                <SelectContent>
                  {PERIODOS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} ({p.horaInicio} - {p.horaFim})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Hora Inicio
                </label>
                <Input
                  type="time"
                  value={novoTurno.horaInicio}
                  onChange={(e) =>
                    setNovoTurno({ ...novoTurno, horaInicio: e.target.value })
                  }
                  className="mt-1.5 h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Hora Fim
                </label>
                <Input
                  type="time"
                  value={novoTurno.horaFim}
                  onChange={(e) =>
                    setNovoTurno({ ...novoTurno, horaFim: e.target.value })
                  }
                  className="mt-1.5 h-12"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Observacoes (opcional)
              </label>
              <textarea
                value={novoTurno.observacao}
                onChange={(e) =>
                  setNovoTurno({ ...novoTurno, observacao: e.target.value })
                }
                placeholder="Ex: Levar almoco, dar banho as 10h..."
                className="mt-1.5 w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Pontos de Atencao (opcional)
              </label>
              <textarea
                value={novoTurno.pontosAtencao}
                onChange={(e) =>
                  setNovoTurno({ ...novoTurno, pontosAtencao: e.target.value })
                }
                placeholder="Ex: Alergia a dipirona, pressao alta, nao pode comer acucar..."
                className="mt-1.5 w-full min-h-[80px] px-3 py-2 rounded-md border border-amber-200 bg-amber-50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Informacoes importantes sobre cuidados especiais
              </p>
            </div>

            <Button
              onClick={handleAddTurno}
              className="w-full h-12 text-base mt-4"
              disabled={!novoTurno.acompanhanteId || !novoTurno.periodo}
            >
              Adicionar Turno
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
