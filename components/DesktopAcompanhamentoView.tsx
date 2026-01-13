"use client";

import { useState } from "react";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  AlertTriangle,
  Sun,
  FileText,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RegistroAcompanhamento } from "@/lib/types";

interface DesktopAcompanhamentoViewProps {
  registros: RegistroAcompanhamento[];
  onAdd: (registro: Omit<RegistroAcompanhamento, "id" | "createdAt">) => void;
  onDelete: (id: number) => void;
}

export function DesktopAcompanhamentoView({
  registros,
  onAdd,
  onDelete,
}: DesktopAcompanhamentoViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoRegistro, setNovoRegistro] = useState({
    tipo: "" as "intercorrencia" | "dia_bom" | "observacao" | "",
    titulo: "",
    descricao: "",
    gravidade: "" as "leve" | "moderada" | "grave" | "",
    data: format(new Date(), "yyyy-MM-dd"),
  });

  const handleAdd = () => {
    if (novoRegistro.tipo && novoRegistro.titulo) {
      onAdd({
        tipo: novoRegistro.tipo as "intercorrencia" | "dia_bom" | "observacao",
        titulo: novoRegistro.titulo,
        descricao: novoRegistro.descricao,
        gravidade: novoRegistro.tipo === "intercorrencia" ? (novoRegistro.gravidade as "leve" | "moderada" | "grave") : undefined,
        data: novoRegistro.data,
      });
      setNovoRegistro({
        tipo: "",
        titulo: "",
        descricao: "",
        gravidade: "",
        data: format(new Date(), "yyyy-MM-dd"),
      });
      setIsDialogOpen(false);
    }
  };

  // Calcular estatisticas dos ultimos 30 dias
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return format(date, "yyyy-MM-dd");
  });

  const registrosPorDia = last30Days.map((data) => {
    const dosDia = registros.filter((r) => r.data === data);
    const intercorrencias = dosDia.filter((r) => r.tipo === "intercorrencia").length;
    const diasBons = dosDia.filter((r) => r.tipo === "dia_bom").length;
    return { data, intercorrencias, diasBons, total: dosDia.length };
  });

  const totalIntercorrencias = registros.filter((r) => r.tipo === "intercorrencia").length;
  const totalDiasBons = registros.filter((r) => r.tipo === "dia_bom").length;
  const totalObservacoes = registros.filter((r) => r.tipo === "observacao").length;

  // Calcular tendencia (ultimos 7 dias vs 7 dias anteriores)
  const ultimos7 = registrosPorDia.slice(-7);
  const anteriores7 = registrosPorDia.slice(-14, -7);
  const intercorrenciasRecentes = ultimos7.reduce((sum, d) => sum + d.intercorrencias, 0);
  const intercorrenciasAnteriores = anteriores7.reduce((sum, d) => sum + d.intercorrencias, 0);
  const tendencia = intercorrenciasAnteriores > 0
    ? ((intercorrenciasRecentes - intercorrenciasAnteriores) / intercorrenciasAnteriores) * 100
    : 0;

  // Ordenar registros por data (mais recentes primeiro)
  const registrosOrdenados = [...registros].sort((a, b) =>
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case "intercorrencia":
        return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", label: "Intercorrencia" };
      case "dia_bom":
        return { icon: Sun, color: "text-green-500", bg: "bg-green-50", border: "border-green-200", label: "Dia Bom" };
      default:
        return { icon: FileText, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", label: "Observacao" };
    }
  };

  const getGravidadeColor = (gravidade?: string) => {
    switch (gravidade) {
      case "leve": return "bg-yellow-100 text-yellow-700";
      case "moderada": return "bg-orange-100 text-orange-700";
      case "grave": return "bg-red-100 text-red-700";
      default: return "";
    }
  };

  // Calcular altura maxima para o grafico
  const maxValue = Math.max(...registrosPorDia.map(d => d.intercorrencias + d.diasBons), 1);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Acompanhamento do Paciente
            </h2>
            <p className="text-gray-600">
              Monitoramento da evolucao e registro de intercorrencias
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Registro</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tipo de Registro
                  </label>
                  <Select
                    value={novoRegistro.tipo}
                    onValueChange={(v) => setNovoRegistro({ ...novoRegistro, tipo: v as "intercorrencia" | "dia_bom" | "observacao" })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intercorrencia">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Intercorrencia
                        </div>
                      </SelectItem>
                      <SelectItem value="dia_bom">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-green-500" />
                          Dia Bom
                        </div>
                      </SelectItem>
                      <SelectItem value="observacao">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          Observacao
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Data</label>
                  <Input
                    type="date"
                    value={novoRegistro.data}
                    onChange={(e) => setNovoRegistro({ ...novoRegistro, data: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Titulo</label>
                  <Input
                    type="text"
                    value={novoRegistro.titulo}
                    onChange={(e) => setNovoRegistro({ ...novoRegistro, titulo: e.target.value })}
                    placeholder="Ex: Febre alta, Dia tranquilo..."
                    className="mt-1.5"
                  />
                </div>

                {novoRegistro.tipo === "intercorrencia" && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Gravidade
                    </label>
                    <Select
                      value={novoRegistro.gravidade}
                      onValueChange={(v) => setNovoRegistro({ ...novoRegistro, gravidade: v as "leve" | "moderada" | "grave" })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Selecione a gravidade..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leve">
                          <span className="text-yellow-600">Leve</span>
                        </SelectItem>
                        <SelectItem value="moderada">
                          <span className="text-orange-600">Moderada</span>
                        </SelectItem>
                        <SelectItem value="grave">
                          <span className="text-red-600">Grave</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Descricao (opcional)
                  </label>
                  <textarea
                    value={novoRegistro.descricao}
                    onChange={(e) => setNovoRegistro({ ...novoRegistro, descricao: e.target.value })}
                    placeholder="Descreva os detalhes..."
                    className="mt-1.5 w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <Button
                  onClick={handleAdd}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={!novoRegistro.tipo || !novoRegistro.titulo}
                >
                  Adicionar Registro
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalIntercorrencias}</div>
                <div className="text-sm text-gray-500">Intercorrencias</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <Sun className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalDiasBons}</div>
                <div className="text-sm text-gray-500">Dias Bons</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalObservacoes}</div>
                <div className="text-sm text-gray-500">Observacoes</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${tendencia <= 0 ? "bg-green-50" : "bg-red-50"}`}>
                {tendencia <= 0 ? (
                  <TrendingDown className="h-6 w-6 text-green-500" />
                ) : (
                  <TrendingUp className="h-6 w-6 text-red-500" />
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {tendencia <= 0 ? "" : "+"}{tendencia.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-500">Tendencia 7 dias</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Ultimos 30 dias</h3>
          </div>
          <div className="flex items-end gap-1 h-32">
            {registrosPorDia.map((dia, idx) => {
              const height = ((dia.intercorrencias + dia.diasBons) / maxValue) * 100;
              const hasIntercorrencia = dia.intercorrencias > 0;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col justify-end group relative"
                >
                  {dia.total > 0 ? (
                    <div
                      className={`rounded-t transition-all hover:opacity-80 cursor-pointer ${hasIntercorrencia ? "bg-red-400" : "bg-green-400"}`}
                      style={{ height: `${Math.max(height, 8)}%` }}
                    />
                  ) : (
                    <div className="bg-gray-100 rounded-t" style={{ height: "4px" }} />
                  )}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {format(parseISO(dia.data), "dd/MM")}: {dia.intercorrencias} int., {dia.diasBons} bons
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">30 dias atras</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded" />
                <span className="text-xs text-gray-500">Intercorrencia</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded" />
                <span className="text-xs text-gray-500">Dia Bom</span>
              </div>
            </div>
            <span className="text-xs text-gray-400">Hoje</span>
          </div>
        </div>

        {/* Records List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Historico de Registros</h3>
          </div>
          {registrosOrdenados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Nenhum registro
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Registre intercorrencias e dias bons para acompanhar a evolucao
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {registrosOrdenados.map((registro) => {
                const config = getTipoConfig(registro.tipo);
                const Icon = config.icon;

                return (
                  <div key={registro.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          {registro.gravidade && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getGravidadeColor(registro.gravidade)}`}>
                              {registro.gravidade}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {format(parseISO(registro.data), "dd/MM/yyyy")}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900">
                          {registro.titulo}
                        </h4>
                        {registro.descricao && (
                          <p className="text-sm text-gray-600 mt-1">
                            {registro.descricao}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(registro.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
