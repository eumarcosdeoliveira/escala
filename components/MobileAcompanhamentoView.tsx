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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RegistroAcompanhamento } from "@/lib/types";

interface MobileAcompanhamentoViewProps {
  registros: RegistroAcompanhamento[];
  onAdd: (registro: Omit<RegistroAcompanhamento, "id" | "createdAt">) => void;
  onDelete: (id: number) => void;
}

export function MobileAcompanhamentoView({
  registros,
  onAdd,
  onDelete,
}: MobileAcompanhamentoViewProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
      setIsSheetOpen(false);
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
        return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" };
      case "dia_bom":
        return { icon: Sun, color: "text-green-500", bg: "bg-green-50", border: "border-green-200" };
      default:
        return { icon: FileText, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" };
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
    <div className="flex flex-col h-full pb-20">
      {/* Header com estatisticas */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 py-6 text-white">
        <h2 className="text-xl font-bold mb-1">Acompanhamento</h2>
        <p className="text-sm text-white/80 mb-4">
          Monitoramento da evolucao do paciente
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-300" />
            <div className="text-2xl font-bold">{totalIntercorrencias}</div>
            <div className="text-xs text-white/80">Intercorrencias</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <Sun className="h-5 w-5 mx-auto mb-1 text-yellow-300" />
            <div className="text-2xl font-bold">{totalDiasBons}</div>
            <div className="text-xs text-white/80">Dias Bons</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            {tendencia <= 0 ? (
              <TrendingDown className="h-5 w-5 mx-auto mb-1 text-green-300" />
            ) : (
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-red-300" />
            )}
            <div className="text-2xl font-bold">
              {tendencia <= 0 ? "" : "+"}{tendencia.toFixed(0)}%
            </div>
            <div className="text-xs text-white/80">Tendencia 7d</div>
          </div>
        </div>

        {/* Mini grafico */}
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-medium">Ultimos 30 dias</span>
          </div>
          <div className="flex items-end gap-0.5 h-16">
            {registrosPorDia.map((dia, idx) => {
              const height = ((dia.intercorrencias + dia.diasBons) / maxValue) * 100;
              const hasIntercorrencia = dia.intercorrencias > 0;
              const hasDiaBom = dia.diasBons > 0;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col justify-end"
                  title={`${format(parseISO(dia.data), "dd/MM")}: ${dia.intercorrencias} int., ${dia.diasBons} bons`}
                >
                  {dia.total > 0 ? (
                    <div
                      className={`rounded-t-sm ${hasIntercorrencia ? "bg-red-400" : "bg-green-400"}`}
                      style={{ height: `${Math.max(height, 10)}%` }}
                    />
                  ) : (
                    <div className="bg-white/20 rounded-t-sm" style={{ height: "4px" }} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-white/60">30 dias atras</span>
            <span className="text-[10px] text-white/60">Hoje</span>
          </div>
        </div>
      </div>

      {/* Lista de registros */}
      <div className="flex-1 overflow-auto">
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
            <Button onClick={() => setIsSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Registro
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {registrosOrdenados.map((registro) => {
              const config = getTipoConfig(registro.tipo);
              const Icon = config.icon;

              return (
                <div key={registro.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {registro.titulo}
                        </h4>
                        {registro.gravidade && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getGravidadeColor(registro.gravidade)}`}>
                            {registro.gravidade}
                          </span>
                        )}
                      </div>
                      {registro.descricao && (
                        <p className="text-sm text-gray-600 mb-2">
                          {registro.descricao}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {format(parseISO(registro.data), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(registro.id)}
                      className="text-gray-400 hover:text-red-500 flex-shrink-0"
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

      {/* FAB - Add registro */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40 bg-indigo-600 hover:bg-indigo-700"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl max-h-[90vh] overflow-auto">
          <SheetHeader>
            <SheetTitle>Novo Registro</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6 pb-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tipo de Registro
              </label>
              <Select
                value={novoRegistro.tipo}
                onValueChange={(v) => setNovoRegistro({ ...novoRegistro, tipo: v as "intercorrencia" | "dia_bom" | "observacao" })}
              >
                <SelectTrigger className="mt-1.5 h-12">
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
                className="mt-1.5 h-12"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Titulo</label>
              <Input
                type="text"
                value={novoRegistro.titulo}
                onChange={(e) => setNovoRegistro({ ...novoRegistro, titulo: e.target.value })}
                placeholder="Ex: Febre alta, Dia tranquilo..."
                className="mt-1.5 h-12"
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
                  <SelectTrigger className="mt-1.5 h-12">
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
              className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700"
              disabled={!novoRegistro.tipo || !novoRegistro.titulo}
            >
              Adicionar Registro
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
