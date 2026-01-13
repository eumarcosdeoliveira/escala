"use client";

import { BarChart3, Clock, Calendar, Users, TrendingUp, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Acompanhante, Turno, RegistroAcompanhamento } from "@/lib/types";

interface MobileRelatorioViewProps {
  acompanhantes: Acompanhante[];
  turnos: Turno[];
  registros?: RegistroAcompanhamento[];
  onSelectAcompanhante?: (acompanhante: Acompanhante) => void;
}

export function MobileRelatorioView({
  acompanhantes,
  turnos,
  registros = [],
  onSelectAcompanhante,
}: MobileRelatorioViewProps) {
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

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header stats */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-6 text-white">
        <h2 className="text-xl font-bold mb-1">Resumo</h2>
        <p className="text-sm text-white/80 mb-4">
          Visao geral das horas trabalhadas
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <Users className="h-5 w-5 mx-auto mb-1" />
            <div className="text-2xl font-bold">{acompanhantes.length}</div>
            <div className="text-xs text-white/80">Pessoas</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <Calendar className="h-5 w-5 mx-auto mb-1" />
            <div className="text-2xl font-bold">{turnos.length}</div>
            <div className="text-xs text-white/80">Turnos</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1" />
            <div className="text-2xl font-bold">{totalHorasGeral.toFixed(0)}</div>
            <div className="text-xs text-white/80">Horas</div>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="flex-1 overflow-auto">
        {acompanhantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Sem dados
            </h3>
            <p className="text-sm text-gray-500 text-center">
              Cadastre acompanhantes e registre turnos para ver o resumo
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Ranking de Horas
            </h3>

            {acompanhantesOrdenados.map((acompanhante, index) => {
              const totalHoras = getTotalHoras(acompanhante.id);
              const totalTurnos = getTotalTurnos(acompanhante.id);
              const porcentagem = (totalHoras / maxHoras) * 100;

              return (
                <button
                  key={acompanhante.id}
                  onClick={() => onSelectAcompanhante?.(acompanhante)}
                  className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-left hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
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
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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

            {/* Total card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 text-white mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">
                    Total Geral
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {totalHorasGeral.toFixed(1)}h
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-7 w-7" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Em {turnos.length} turnos registrados
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
