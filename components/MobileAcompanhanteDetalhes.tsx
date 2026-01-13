"use client";

import { useState, useRef } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  X,
  Edit2,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Camera,
  Save,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Acompanhante, Turno, RegistroAcompanhamento, Disponibilidade } from "@/lib/types";

interface MobileAcompanhanteDetalhesProps {
  acompanhante: Acompanhante;
  turnos: Turno[];
  registros: RegistroAcompanhamento[];
  onClose: () => void;
  onUpdate: (id: number, data: Partial<Acompanhante>) => void;
}

const DIAS_SEMANA = [
  { id: "domingo", label: "Dom" },
  { id: "segunda", label: "Seg" },
  { id: "terca", label: "Ter" },
  { id: "quarta", label: "Qua" },
  { id: "quinta", label: "Qui" },
  { id: "sexta", label: "Sex" },
  { id: "sabado", label: "Sab" },
] as const;

const PERIODOS = [
  { id: "manha", label: "M", nome: "Manha" },
  { id: "tarde", label: "T", nome: "Tarde" },
  { id: "noite", label: "N", nome: "Noite" },
  { id: "madrugada", label: "Md", nome: "Madrugada" },
] as const;

const defaultDisponibilidade: Disponibilidade = {
  domingo: { ativo: false, periodos: [] },
  segunda: { ativo: false, periodos: [] },
  terca: { ativo: false, periodos: [] },
  quarta: { ativo: false, periodos: [] },
  quinta: { ativo: false, periodos: [] },
  sexta: { ativo: false, periodos: [] },
  sabado: { ativo: false, periodos: [] },
};

export function MobileAcompanhanteDetalhes({
  acompanhante,
  turnos,
  registros,
  onClose,
  onUpdate,
}: MobileAcompanhanteDetalhesProps) {
  const [activeTab, setActiveTab] = useState<"turnos" | "disponibilidade">("turnos");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nome: acompanhante.nome,
    telefone: acompanhante.telefone,
    avatar: acompanhante.avatar,
  });
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade>(
    acompanhante.disponibilidade || defaultDisponibilidade
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setEditData({ ...editData, avatar: url });
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    } finally {
      setUploading(false);
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

  const handleSave = () => {
    onUpdate(acompanhante.id, editData);
    setIsEditing(false);
  };

  const handleSaveDisponibilidade = () => {
    onUpdate(acompanhante.id, { disponibilidade });
  };

  const toggleDia = (dia: keyof Disponibilidade) => {
    setDisponibilidade((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        ativo: !prev[dia].ativo,
        periodos: !prev[dia].ativo ? ["manha", "tarde", "noite", "madrugada"] : [],
      },
    }));
  };

  const togglePeriodo = (dia: keyof Disponibilidade, periodo: "manha" | "tarde" | "noite" | "madrugada") => {
    setDisponibilidade((prev) => {
      const periodos = prev[dia].periodos.includes(periodo)
        ? prev[dia].periodos.filter((p) => p !== periodo)
        : [...prev[dia].periodos, periodo];
      return {
        ...prev,
        [dia]: {
          ativo: periodos.length > 0,
          periodos,
        },
      };
    });
  };

  // Calcular estatisticas
  const totalHoras = turnos.reduce((total, t) => {
    const [h1, m1] = t.horaInicio.split(":").map(Number);
    const [h2, m2] = t.horaFim.split(":").map(Number);
    let horas = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
    if (horas < 0) horas += 24;
    return total + horas;
  }, 0);

  // Agrupar turnos por data
  const turnosPorData = turnos.reduce((acc, turno) => {
    if (!acc[turno.data]) {
      acc[turno.data] = [];
    }
    acc[turno.data].push(turno);
    return acc;
  }, {} as Record<string, Turno[]>);

  // Ordenar datas (mais recentes primeiro)
  const datasOrdenadas = Object.keys(turnosPorData).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Verificar se houve intercorrencia em uma data
  const temIntercorrencia = (data: string) => {
    return registros.some((r) => r.data === data && r.tipo === "intercorrencia");
  };

  const periodoLabel: Record<string, string> = {
    manha: "Manha",
    tarde: "Tarde",
    noite: "Noite",
    madrugada: "Madrugada",
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div
        className="px-4 py-6 text-white relative"
        style={{ backgroundColor: acompanhante.cor }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/20 hover:bg-white/30"
        >
          <X className="h-5 w-5" />
        </button>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30"
          >
            <Edit2 className="h-5 w-5" />
          </button>
        )}

        <div className="flex flex-col items-center pt-8">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white/30">
              {(isEditing ? editData.avatar : acompanhante.avatar) ? (
                <AvatarImage src={isEditing ? editData.avatar! : acompanhante.avatar!} />
              ) : null}
              <AvatarFallback
                className="text-3xl font-bold text-white"
                style={{ backgroundColor: acompanhante.cor }}
              >
                {acompanhante.nome.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </>
            )}
          </div>

          {isEditing ? (
            <div className="mt-4 w-full max-w-xs space-y-3">
              <Input
                value={editData.nome}
                onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                placeholder="Nome"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-center"
              />
              <Input
                value={editData.telefone}
                onChange={(e) =>
                  setEditData({ ...editData, telefone: formatarTelefone(e.target.value) })
                }
                placeholder="Telefone"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-center"
              />
              <Button
                onClick={handleSave}
                className="w-full bg-white text-gray-800 hover:bg-white/90"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mt-4">{acompanhante.nome}</h2>
              {acompanhante.telefone && (
                <a
                  href={`tel:${acompanhante.telefone.replace(/\D/g, "")}`}
                  className="flex items-center gap-1 mt-1 text-white/80 hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  {acompanhante.telefone}
                </a>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <Calendar className="h-5 w-5 mx-auto mb-1" />
              <div className="text-2xl font-bold">{turnos.length}</div>
              <div className="text-xs text-white/80">Turnos</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1" />
              <div className="text-2xl font-bold">{totalHoras.toFixed(0)}h</div>
              <div className="text-xs text-white/80">Total</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("turnos")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "turnos"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500"
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-1" />
          Historico
        </button>
        <button
          onClick={() => setActiveTab("disponibilidade")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "disponibilidade"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500"
          }`}
        >
          <CalendarDays className="h-4 w-4 inline mr-1" />
          Disponibilidade
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "turnos" ? (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Historico de Turnos
            </h3>

            {turnos.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Nenhum turno registrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {datasOrdenadas.map((data) => {
                  const turnosDoDia = turnosPorData[data];
                  const hadIntercorrencia = temIntercorrencia(data);

                  return (
                    <div
                      key={data}
                      className={`rounded-xl border p-4 ${
                        hadIntercorrencia
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {/* Data header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {format(parseISO(data), "EEEE", { locale: ptBR })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(parseISO(data), "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                        </div>
                        {hadIntercorrencia ? (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            Intercorrencia
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="h-3 w-3" />
                            OK
                          </div>
                        )}
                      </div>

                      {/* Turnos do dia */}
                      <div className="space-y-2">
                        {turnosDoDia.map((turno) => (
                          <div
                            key={turno.id}
                            className="flex items-center justify-between py-2 border-t border-gray-100"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {periodoLabel[turno.periodo]}
                              </p>
                              <p className="text-xs text-gray-500">
                                {turno.horaInicio} - {turno.horaFim}
                              </p>
                            </div>
                            {turno.observacao && (
                              <p className="text-xs text-gray-400 italic max-w-[150px] truncate">
                                {turno.observacao}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Disponibilidade Semanal
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Selecione os dias e horarios que {acompanhante.nome} pode participar
            </p>

            {/* Grid de disponibilidade */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header com periodos */}
              <div className="grid grid-cols-5 bg-gray-50 border-b border-gray-200">
                <div className="p-2 text-center text-xs font-medium text-gray-500">Dia</div>
                {PERIODOS.map((p) => (
                  <div key={p.id} className="p-2 text-center text-xs font-medium text-gray-500">
                    {p.label}
                  </div>
                ))}
              </div>

              {/* Linhas dos dias */}
              {DIAS_SEMANA.map((dia) => {
                const diaDisponibilidade = disponibilidade[dia.id as keyof Disponibilidade];
                return (
                  <div
                    key={dia.id}
                    className="grid grid-cols-5 border-b border-gray-100 last:border-b-0"
                  >
                    <button
                      onClick={() => toggleDia(dia.id as keyof Disponibilidade)}
                      className={`p-3 text-center text-sm font-medium transition-colors ${
                        diaDisponibilidade.ativo
                          ? "bg-primary/10 text-primary"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {dia.label}
                    </button>
                    {PERIODOS.map((periodo) => {
                      const isActive = diaDisponibilidade.periodos.includes(periodo.id);
                      return (
                        <button
                          key={periodo.id}
                          onClick={() => togglePeriodo(dia.id as keyof Disponibilidade, periodo.id)}
                          className={`p-3 text-center transition-colors ${
                            isActive
                              ? "bg-green-100 text-green-700"
                              : "text-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle className="h-5 w-5 mx-auto" />
                          ) : (
                            <div className="h-5 w-5 mx-auto rounded-full border-2 border-gray-300" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-100 rounded" />
                <span>Disponivel</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                <span>Indisponivel</span>
              </div>
            </div>

            {/* Resumo */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Resumo</h4>
              <div className="flex flex-wrap gap-2">
                {DIAS_SEMANA.map((dia) => {
                  const diaDisp = disponibilidade[dia.id as keyof Disponibilidade];
                  if (!diaDisp.ativo) return null;
                  return (
                    <div
                      key={dia.id}
                      className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs"
                    >
                      <span className="font-medium">{dia.label}:</span>{" "}
                      {diaDisp.periodos.map((p) => PERIODOS.find((x) => x.id === p)?.label).join(", ")}
                    </div>
                  );
                })}
                {!Object.values(disponibilidade).some((d) => d.ativo) && (
                  <p className="text-sm text-gray-400">Nenhuma disponibilidade cadastrada</p>
                )}
              </div>
            </div>

            {/* Botao salvar */}
            <Button
              onClick={handleSaveDisponibilidade}
              className="w-full mt-4"
              style={{ backgroundColor: acompanhante.cor }}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Disponibilidade
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
