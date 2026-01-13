"use client";

import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Acompanhante } from "@/lib/types";

interface AcompanhantesManagerProps {
  acompanhantes: Acompanhante[];
  onAdd: (nome: string) => void;
  onRemove: (id: number) => void;
}

export function AcompanhantesManager({
  acompanhantes,
  onAdd,
  onRemove,
}: AcompanhantesManagerProps) {
  const [novoNome, setNovoNome] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (novoNome.trim()) {
      onAdd(novoNome.trim());
      setNovoNome("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Gerenciar Acompanhantes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Acompanhantes Cadastrados</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Add form */}
          <div className="flex gap-2 mb-4">
            <Input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Nome do acompanhante..."
              className="flex-1"
            />
            <Button onClick={handleAdd} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* List */}
          {acompanhantes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum acompanhante cadastrado</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {acompanhantes.map((acompanhante) => (
                <div
                  key={acompanhante.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        style={{ backgroundColor: acompanhante.cor }}
                        className="text-white text-xs"
                      >
                        {acompanhante.nome.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {acompanhante.nome}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(acompanhante.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
