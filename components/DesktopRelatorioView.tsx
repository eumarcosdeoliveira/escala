"use client";

import { BarChart3, Clock, Calendar, Users, TrendingUp, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Acompanhante, Turno, RegistroAcompanhamento } from "@/lib/types";

interface DesktopRelatorioViewProps {
  acompanhantes: Acompanhante[];
  turnos: Turno[];
  registros?: RegistroAcompanhamento[];
  onSelectAcompanhante?: (acompanhante: Acompanhante) => void;
}

export function DesktopRelatorioView({
  acompanhantes,
  turnos,
  registros = [],
  onSelectAcompanhante,
}: DesktopRelatorioViewProps) {
  // Calcula horas apenas de turnos com checkout realizado
  const getTotalHoras = (acompanhanteId: number) => {
    return turnos
      .filter((t) => t.acompanhanteId === acompanhanteId && t.checkoutHora)
      .reduce((total, t) => {
        // Usa as horas reais de checkin/checkout se disponiveis
        const horaInicio = t.checkinHora || t.horaInicio;
        const horaFim = t.checkoutHora || t.horaFim;
        const [h1, m1] = horaInicio.split(":").map(Number);
        const [h2, m2] = horaFim.split(":").map(Number);
        let horas = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
        if (horas < 0) horas += 24;
        return total + horas;
      }, 0);
  };

  const getTotalTurnos = (acompanhanteId: number) => {
    // Conta apenas turnos concluidos (com checkout)
    return turnos.filter((t) => t.acompanhanteId === acompanhanteId && t.checkoutHora).length;
  };

  const getTotalTurnosAgendados = (acompanhanteId: number) => {
    return turnos.filter((t) => t.acompanhanteId === acompanhanteId).length;
  };

  const totalHorasGeral = acompanhantes.reduce(
    (acc, a) => acc + getTotalHoras(a.id),
    0
  );

  const maxHoras = Math.max(
    ...acompanhantes.map((a) => getTotalHoras(a.id)),
    1
  );

  // Sort by hours descending
  const acompanhantesOrdenados = [...acompanhantes].sort(
    (a, b) => getTotalHoras(b.id) - getTotalHoras(a.id)
  );

  const totalIntercorrencias = registros.filter((r) => r.tipo === "intercorrencia").length;
  const totalDiasBons = registros.filter((r) => r.tipo === "dia_bom").length;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Resumo</h2>
          <p className="text-gray-600">
            Visao geral das horas trabalhadas e estatisticas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-50 rounded-lg">
                <Users className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{acompanhantes.length}</div>
                <div className="text-sm text-gray-500">Pessoas</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{turnos.length}</div>
                <div className="text-sm text-gray-500">Turnos</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalHorasGeral.toFixed(0)}</div>
                <div className="text-sm text-gray-500">Horas Total</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-500" />
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
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalDiasBons}</div>
                <div className="text-sm text-gray-500">Dias Bons</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Ranking */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Ranking de Horas</h3>
            </div>
            {acompanhantes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Sem dados
                </h3>
                <p className="text-sm text-gray-500 text-center">
                  Cadastre acompanhantes e registre turnos para ver o resumo
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {acompanhantesOrdenados.map((acompanhante, index) => {
                  const totalHoras = getTotalHoras(acompanhante.id);
                  const totalTurnos = getTotalTurnos(acompanhante.id);
                  const porcentagem = (totalHoras / maxHoras) * 100;

                  return (
                    <button
                      key={acompanhante.id}
                      onClick={() => onSelectAcompanhante?.(acompanhante)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 mb-2">
                        {/* Ranking badge */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? "bg-amber-100 text-amber-700"
                              : index === 1
                              ? "bg-gray-200 text-gray-700"
                              : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <Avatar className="h-10 w-10">
                          {acompanhante.avatar && (
                            <AvatarImage src={acompanhante.avatar} />
                          )}
                          <AvatarFallback
                            style={{ backgroundColor: acompanhante.cor }}
                            className="text-white text-sm font-semibold"
                          >
                            {acompanhante.nome.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {acompanhante.nome}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {totalTurnos} concluido(s) / {getTotalTurnosAgendados(acompanhante.id)} agendado(s)
                          </p>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <div
                            className="text-xl font-bold"
                            style={{ color: acompanhante.cor }}
                          >
                            {totalHoras.toFixed(1)}h
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden ml-12">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${porcentagem}%`,
                            backgroundColor: acompanhante.cor,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary card */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">
                    Total Geral
                  </p>
                  <p className="text-4xl font-bold mt-1">
                    {totalHorasGeral.toFixed(1)}h
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Em {turnos.length} turnos registrados
              </p>
            </div>

            {/* Media por pessoa */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                Media por Pessoa
              </h4>
              <p className="text-3xl font-bold text-gray-900">
                {acompanhantes.length > 0
                  ? (totalHorasGeral / acompanhantes.length).toFixed(1)
                  : "0"}
                h
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {acompanhantes.length > 0
                  ? (turnos.length / acompanhantes.length).toFixed(1)
                  : "0"}{" "}
                turnos em media
              </p>
            </div>

            {/* Distribuicao visual */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-4">
                Distribuicao
              </h4>
              <div className="flex items-end gap-1 h-24">
                {acompanhantesOrdenados.map((acompanhante) => {
                  const horas = getTotalHoras(acompanhante.id);
                  const height = (horas / maxHoras) * 100;
                  return (
                    <div
                      key={acompanhante.id}
                      className="flex-1 rounded-t transition-all hover:opacity-80"
                      style={{
                        height: `${Math.max(height, 8)}%`,
                        backgroundColor: acompanhante.cor,
                      }}
                      title={`${acompanhante.nome}: ${horas.toFixed(1)}h`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
