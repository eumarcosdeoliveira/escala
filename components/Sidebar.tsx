"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Megaphone,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
}

export function Sidebar({
  currentDate,
  selectedDate,
  onSelectDate,
  acompanhantes,
  turnos,
  onAddTurno,
}: SidebarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary-700">
                        <Check className="h-3 w-3" />
                        Check-in
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-500 font-medium hover:text-gray-700 ml-auto">
                        <Megaphone className="h-3 w-3" />
                        Anunciar
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-500 font-medium hover:text-gray-700">
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

      {/* Bottom decoration */}
      <div className="flex justify-center gap-4 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-gray-100" />
        ))}
      </div>
    </aside>
  );
}
