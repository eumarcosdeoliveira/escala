"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  ArrowLeftRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Acompanhante, Turno } from "@/lib/types";

interface SidebarProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  acompanhantes: Acompanhante[];
  turnos: Turno[];
  onAddTurno: (turno: Omit<Turno, "id">) => void;
  onCheckin?: (id: number, hora: string) => void;
  onCheckout?: (id: number, hora: string) => void;
  onTrocar?: (id: number, novoAcompanhanteId: number) => void;
}

export function Sidebar({
  currentDate,
  selectedDate,
  onSelectDate,
  acompanhantes,
  turnos,
  onAddTurno,
  onCheckin,
  onCheckout,
  onTrocar,
}: SidebarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTrocarDialogOpen, setIsTrocarDialogOpen] = useState(false);
  const [turnoParaTrocar, setTurnoParaTrocar] = useState<Turno | null>(null);
  const [selectedAcompanhante, setSelectedAcompanhante] = useState("");
  const [novoTurno, setNovoTurno] = useState({
    acompanhanteId: "",
    periodo: "",
    horaInicio: "",
    horaFim: "",
    observacao: "",
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const turnosDoDia = turnos.filter(
    (t) => t.data === format(selectedDate, "yyyy-MM-dd")
  );

  const getAcompanhante = (id: number) =>
    acompanhantes.find((a) => a.id === id);

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  };

  const handleCheckin = (turno: Turno) => {
    if (onCheckin) {
      onCheckin(turno.id, getCurrentTime());
    }
  };

  const handleCheckout = (turno: Turno) => {
    if (onCheckout) {
      onCheckout(turno.id, getCurrentTime());
    }
  };

  const handleOpenTrocar = (turno: Turno) => {
    setTurnoParaTrocar(turno);
    setSelectedAcompanhante("");
    setIsTrocarDialogOpen(true);
  };

  const handleConfirmTrocar = () => {
    if (onTrocar && turnoParaTrocar && selectedAcompanhante) {
      onTrocar(turnoParaTrocar.id, parseInt(selectedAcompanhante));
      setIsTrocarDialogOpen(false);
      setTurnoParaTrocar(null);
      setSelectedAcompanhante("");
    }
  };

  const handleAddTurno = () => {
    if (
      novoTurno.acompanhanteId &&
      novoTurno.periodo &&
      novoTurno.horaInicio &&
      novoTurno.horaFim
    ) {
      onAddTurno({
        acompanhanteId: parseInt(novoTurno.acompanhanteId),
        data: format(selectedDate, "yyyy-MM-dd"),
        periodo: novoTurno.periodo as "manha" | "tarde" | "noite" | "madrugada",
        horaInicio: novoTurno.horaInicio,
        horaFim: novoTurno.horaFim,
        observacao: novoTurno.observacao,
        pontosAtencao: "",
      });
      setNovoTurno({
        acompanhanteId: "",
        periodo: "",
        horaInicio: "",
        horaFim: "",
        observacao: "",
      });
      setIsDialogOpen(false);
    }
  };

  const mesAno = format(currentDate, "MMMM yyyy", { locale: ptBR });

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Calendar mini */}
      <div className="p-4">
        <div className="bg-primary text-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" className="text-white h-6 w-6">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium capitalize">{mesAno}</span>
            <Button variant="ghost" size="icon" className="text-white h-6 w-6">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
            {["S", "T", "Q", "Q", "S", "S", "D"].map((day, i) => (
              <div key={i} className="text-white/70">
                {day}
              </div>
            ))}
          </div>

          {/* Week days */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => {
              const isSelected = isSameDay(day, selectedDate);
              const dayNumber = format(day, "d");

              return (
                <button
                  key={i}
                  onClick={() => onSelectDate(day)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                    isSelected
                      ? "bg-white text-primary font-bold"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>

          {/* Dotted lines decoration */}
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1 rounded ${
                  i === weekDays.findIndex((d) => isSameDay(d, selectedDate))
                    ? "bg-white"
                    : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selected day info */}
      <div className="px-4 py-2">
        <h3 className="text-sm font-medium text-gray-500">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </h3>
      </div>

      {/* Turnos list */}
      <div className="flex-1 overflow-auto px-4">
        {turnosDoDia.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Nenhum turno registrado</p>
            <p className="text-xs mt-1">para este dia</p>
          </div>
        ) : (
          <div className="space-y-3">
            {turnosDoDia.map((turno) => {
              const acompanhante = getAcompanhante(turno.acompanhanteId);
              if (!acompanhante) return null;

              const hasCheckin = !!turno.checkinHora;
              const hasCheckout = !!turno.checkoutHora;

              return (
                <div
                  key={turno.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div
                    className="h-1"
                    style={{ backgroundColor: acompanhante.cor }}
                  />
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        {acompanhante.avatar && (
                          <AvatarImage src={acompanhante.avatar} />
                        )}
                        <AvatarFallback
                          style={{ backgroundColor: acompanhante.cor }}
                          className="text-white text-sm"
                        >
                          {acompanhante.nome.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {acompanhante.nome}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {turno.periodo.charAt(0).toUpperCase() +
                            turno.periodo.slice(1)}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{turno.horaInicio}</div>
                        <div>{turno.horaFim}</div>
                      </div>
                    </div>

                    {/* Status de checkin/checkout */}
                    {(hasCheckin || hasCheckout) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {hasCheckin && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                            <Check className="h-2.5 w-2.5" />
                            Entrada: {turno.checkinHora}
                          </span>
                        )}
                        {hasCheckout && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            <LogOut className="h-2.5 w-2.5" />
                            Saida: {turno.checkoutHora}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      {!hasCheckin ? (
                        <button
                          onClick={() => handleCheckin(turno)}
                          className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary-700"
                        >
                          <Check className="h-3 w-3" />
                          Check-in
                        </button>
                      ) : !hasCheckout ? (
                        <button
                          onClick={() => handleCheckout(turno)}
                          className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700"
                        >
                          <LogOut className="h-3 w-3" />
                          Check-out
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <Check className="h-3 w-3" />
                          Concluido
                        </span>
                      )}
                      <button
                        onClick={() => handleOpenTrocar(turno)}
                        className="flex items-center gap-1 text-xs text-gray-500 font-medium hover:text-gray-700 ml-auto"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                        Trocar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add turno button */}
      <div className="p-4 border-t border-gray-200">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary hover:bg-primary-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Turno
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Turno</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Acompanhante
                </label>
                <Select
                  value={novoTurno.acompanhanteId}
                  onValueChange={(v) =>
                    setNovoTurno({ ...novoTurno, acompanhanteId: v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {acompanhantes.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Periodo
                </label>
                <Select
                  value={novoTurno.periodo}
                  onValueChange={(v) =>
                    setNovoTurno({ ...novoTurno, periodo: v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Manha (07:00 - 12:00)</SelectItem>
                    <SelectItem value="tarde">Tarde (13:00 - 18:00)</SelectItem>
                    <SelectItem value="noite">Noite (18:00 - 00:00)</SelectItem>
                    <SelectItem value="madrugada">
                      Madrugada (00:00 - 07:00)
                    </SelectItem>
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
                    className="mt-1"
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
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Observacao
                </label>
                <Input
                  type="text"
                  value={novoTurno.observacao}
                  onChange={(e) =>
                    setNovoTurno({ ...novoTurno, observacao: e.target.value })
                  }
                  placeholder="Opcional..."
                  className="mt-1"
                />
              </div>

              <Button onClick={handleAddTurno} className="w-full">
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog para trocar acompanhante */}
      <Dialog open={isTrocarDialogOpen} onOpenChange={setIsTrocarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar Acompanhante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {turnoParaTrocar && (
              <p className="text-sm text-gray-500">
                Selecione quem vai substituir{" "}
                <strong>
                  {getAcompanhante(turnoParaTrocar.acompanhanteId)?.nome}
                </strong>{" "}
                neste turno.
              </p>
            )}
            <Select
              value={selectedAcompanhante}
              onValueChange={setSelectedAcompanhante}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o acompanhante..." />
              </SelectTrigger>
              <SelectContent>
                {acompanhantes
                  .filter((a) => a.id !== turnoParaTrocar?.acompanhanteId)
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
              onClick={handleConfirmTrocar}
              className="w-full"
              disabled={!selectedAcompanhante}
            >
              Confirmar Troca
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom decoration */}
      <div className="flex justify-center gap-4 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-gray-100" />
        ))}
      </div>
    </aside>
  );
}
