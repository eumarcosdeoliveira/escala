"use client";

import { useState } from "react";
import { Plus, Trash2, Clock, Calendar, Phone, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Acompanhante, Turno } from "@/lib/types";

interface MobilePessoasViewProps {
  acompanhantes: Acompanhante[];
  turnos: Turno[];
  onAdd: (nome: string, telefone: string) => void;
  onRemove: (id: number) => void;
  onSelect?: (acompanhante: Acompanhante) => void;
}

export function MobilePessoasView({
  acompanhantes,
  turnos,
  onAdd,
  onRemove,
  onSelect,
}: MobilePessoasViewProps) {
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleAdd = () => {
    if (novoNome.trim()) {
      onAdd(novoNome.trim(), novoTelefone.trim());
      setNovoNome("");
      setNovoTelefone("");
      setIsSheetOpen(false);
    }
  };

  const formatarTelefone = (valor: string) => {
    // Remove tudo que nao e numero
    const numeros = valor.replace(/\D/g, "");

    // Formata como (XX) XXXXX-XXXX
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
    <div className="flex flex-col h-full pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-4 py-6 text-white">
        <h2 className="text-xl font-bold mb-1">Acompanhantes</h2>
        <p className="text-sm text-white/80">
          {acompanhantes.length} pessoa(s) cadastrada(s)
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {acompanhantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nenhum acompanhante
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Adicione os familiares que vao participar da escala
            </p>
            <Button onClick={() => setIsSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {acompanhantes.map((acompanhante) => {
              const totalHoras = getTotalHoras(acompanhante.id);
              const totalTurnos = getTotalTurnos(acompanhante.id);

              return (
                <div
                  key={acompanhante.id}
                  className="p-4 flex items-center gap-4"
                >
                  <Avatar className="h-14 w-14">
                    {acompanhante.avatar && (
                      <AvatarImage src={acompanhante.avatar} />
                    )}
                    <AvatarFallback
                      style={{ backgroundColor: acompanhante.cor }}
                      className="text-white text-lg font-semibold"
                    >
                      {acompanhante.nome.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {acompanhante.nome}
                    </h3>
                    {acompanhante.telefone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsApp(acompanhante.telefone);
                        }}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-0.5"
                      >
                        <Phone className="h-3 w-3" />
                        {acompanhante.telefone}
                      </button>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {totalTurnos} turno(s)
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        {totalHoras.toFixed(1)}h
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelect?.(acompanhante)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
                  >
                    <Edit2 className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(acompanhante.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB - Add pessoa */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40 bg-violet-600 hover:bg-violet-700"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Novo Acompanhante</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6 pb-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nome do acompanhante
              </label>
              <Input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Digite o nome..."
                className="mt-1.5 h-12"
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
                className="mt-1.5 h-12"
                maxLength={16}
              />
            </div>

            <Button
              onClick={handleAdd}
              className="w-full h-12 text-base bg-violet-600 hover:bg-violet-700"
              disabled={!novoNome.trim()}
            >
              Adicionar Acompanhante
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
