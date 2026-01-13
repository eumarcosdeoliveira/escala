"use client";

import { useState } from "react";
import { Plus, Trash2, Clock, Calendar, Phone, Edit2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Acompanhante, Turno } from "@/lib/types";

interface DesktopPessoasViewProps {
  acompanhantes: Acompanhante[];
  turnos: Turno[];
  onAdd: (nome: string, telefone: string) => void;
  onRemove: (id: number) => void;
  onSelect?: (acompanhante: Acompanhante) => void;
}

export function DesktopPessoasView({
  acompanhantes,
  turnos,
  onAdd,
  onRemove,
  onSelect,
}: DesktopPessoasViewProps) {
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdd = () => {
    if (novoNome.trim()) {
      onAdd(novoNome.trim(), novoTelefone.trim());
      setNovoNome("");
      setNovoTelefone("");
      setIsDialogOpen(false);
    }
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNovoTelefone(formatarTelefone(e.target.value));
  };

  const getTotalHoras = (acompanhanteId: number) => {
    return turnos
      .filter((t) => t.acompanhanteId === acompanhanteId)
      .reduce((total, t) => {
        const [h1, m1] = t.horaInicio.split(":").map(Number);
        const [h2, m2] = t.horaFim.split(":").map(Number);
        let horas = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
        if (horas < 0) horas += 24;
        return total + horas;
      }, 0);
  };

  const getTotalTurnos = (acompanhanteId: number) => {
    return turnos.filter((t) => t.acompanhanteId === acompanhanteId).length;
  };

  const handleWhatsApp = (telefone: string) => {
    if (telefone) {
      const numero = telefone.replace(/\D/g, "");
      window.open(`https://wa.me/55${numero}`, "_blank");
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Acompanhantes</h2>
            <p className="text-gray-600">
              {acompanhantes.length} pessoa(s) cadastrada(s)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Acompanhante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Acompanhante</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nome do acompanhante
                  </label>
                  <Input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Digite o nome..."
                    className="mt-1.5"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Telefone (opcional)
                  </label>
                  <Input
                    type="tel"
                    value={novoTelefone}
                    onChange={handleTelefoneChange}
                    placeholder="(00) 00000-0000"
                    className="mt-1.5"
                    maxLength={16}
                  />
                </div>

                <Button
                  onClick={handleAdd}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  disabled={!novoNome.trim()}
                >
                  Adicionar Acompanhante
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid of cards */}
        {acompanhantes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum acompanhante
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Adicione os familiares que vao participar da escala
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {acompanhantes.map((acompanhante) => {
              const totalHoras = getTotalHoras(acompanhante.id);
              const totalTurnos = getTotalTurnos(acompanhante.id);

              return (
                <div
                  key={acompanhante.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      {acompanhante.avatar && (
                        <AvatarImage src={acompanhante.avatar} />
                      )}
                      <AvatarFallback
                        style={{ backgroundColor: acompanhante.cor }}
                        className="text-white text-xl font-semibold"
                      >
                        {acompanhante.nome.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {acompanhante.nome}
                      </h3>
                      {acompanhante.telefone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsApp(acompanhante.telefone);
                          }}
                          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 mt-1"
                        >
                          <Phone className="h-4 w-4" />
                          {acompanhante.telefone}
                        </button>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {totalTurnos} turno(s)
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {totalHoras.toFixed(1)}h
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelect?.(acompanhante)}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      >
                        <Edit2 className="h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(acompanhante.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
