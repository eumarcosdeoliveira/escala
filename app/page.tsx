"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { addWeeks, subWeeks, format, addDays, startOfWeek, isToday, isFuture } from "date-fns";
import { Download, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useMediaQuery";

// Desktop components
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { CoverageGaps } from "@/components/CoverageGaps";
import { AcompanhantesManager } from "@/components/AcompanhantesManager";
import { DesktopAcompanhamentoView } from "@/components/DesktopAcompanhamentoView";
import { DesktopPessoasView } from "@/components/DesktopPessoasView";
import { DesktopRelatorioView } from "@/components/DesktopRelatorioView";
import { DesktopAcompanhanteDetalhes } from "@/components/DesktopAcompanhanteDetalhes";

// Mobile components
import { MobileHeader } from "@/components/MobileHeader";
import { MobileNav } from "@/components/MobileNav";
import { MobileEscalaView } from "@/components/MobileEscalaView";
import { MobileCoberturaView } from "@/components/MobileCoberturaView";
import { MobilePessoasView } from "@/components/MobilePessoasView";
import { MobileRelatorioView } from "@/components/MobileRelatorioView";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { MobileAcompanhamentoView } from "@/components/MobileAcompanhamentoView";
import { MobileAcompanhanteDetalhes } from "@/components/MobileAcompanhanteDetalhes";
import { Acompanhante, Turno, Gap, RegistroAcompanhamento } from "@/lib/types";

const PERIODOS = [
  { id: "manha", nome: "Manha", horaInicio: "07:00", horaFim: "12:00" },
  { id: "tarde", nome: "Tarde", horaInicio: "13:00", horaFim: "18:00" },
  { id: "noite", nome: "Noite", horaInicio: "18:00", horaFim: "00:00" },
  { id: "madrugada", nome: "Madrugada", horaInicio: "00:00", horaFim: "07:00" },
];

type MobileTabType = "escala" | "cobertura" | "pessoas" | "relatorio" | "acompanhamento";
type DesktopTabType = "escala" | "cobertura" | "pessoas" | "relatorio" | "acompanhamento";

export default function Home() {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [desktopTab, setDesktopTab] = useState<DesktopTabType>("escala");
  const [mobileTab, setMobileTab] = useState<MobileTabType>("escala");
  const [acompanhantes, setAcompanhantes] = useState<Acompanhante[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [registrosAcompanhamento, setRegistrosAcompanhamento] = useState<RegistroAcompanhamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAcompanhante, setSelectedAcompanhante] = useState<Acompanhante | null>(null);
  const [showAcompanhanteDetalhes, setShowAcompanhanteDetalhes] = useState(false);
  const [mobileUploading, setMobileUploading] = useState(false);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data function
  const fetchData = async () => {
    try {
      const [acompRes, turnosRes, registrosRes] = await Promise.all([
        fetch("/api/acompanhantes"),
        fetch("/api/turnos"),
        fetch("/api/acompanhamento"),
      ]);

      if (acompRes.ok) {
        setAcompanhantes(await acompRes.json());
      }
      if (turnosRes.ok) {
        setTurnos(await turnosRes.json());
      }
      if (registrosRes.ok) {
        setRegistrosAcompanhamento(await registrosRes.json());
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data after restore
  const handleDataRestore = () => {
    window.location.reload();
  };

  // Mobile backup functions
  const handleMobileDownload = async () => {
    try {
      const response = await fetch("/api/backup");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `escala-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setMenuOpen(false);
    } catch (error) {
      console.error("Erro ao baixar backup:", error);
      alert("Erro ao baixar backup");
    }
  };

  const handleMobileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMobileUploading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        const photosMsg = result.stats.photosRestored > 0 ? `\n${result.stats.photosRestored} fotos` : "";
        alert(`Dados restaurados!\n\n${result.stats.acompanhantes} acompanhantes\n${result.stats.turnos} turnos\n${result.stats.registrosAcompanhamento} registros${photosMsg}`);
        setMenuOpen(false);
        window.location.reload();
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao restaurar:", error);
      alert("Erro ao restaurar. Verifique se o arquivo e valido.");
    } finally {
      setMobileUploading(false);
      if (mobileFileInputRef.current) {
        mobileFileInputRef.current.value = "";
      }
    }
  };

  // Calculate coverage gaps - para hoje e dias futuros
  const gaps = useMemo(() => {
    const gapsMap = new Map<string, Gap[]>();
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    weekDays.forEach((date) => {
      const dataStr = format(date, "yyyy-MM-dd");
      const turnosDoDia = turnos.filter((t) => t.data === dataStr);

      // So calcula gaps para hoje e dias futuros
      const ehHojeOuFuturo = isToday(date) || isFuture(date);

      if (!ehHojeOuFuturo) {
        return; // Pula dias passados
      }

      const periodosGaps: Gap[] = [];

      PERIODOS.forEach((periodo) => {
        const temCobertura = turnosDoDia.some((t) => t.periodo === periodo.id);
        if (!temCobertura) {
          // Se for hoje, verifica se o periodo ja passou
          if (isToday(date)) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinutes = now.getMinutes();
            const [endHour, endMinutes] = periodo.horaFim.split(":").map(Number);

            // Pula periodos que ja terminaram (exceto madrugada que termina no dia seguinte)
            if (periodo.id !== "madrugada") {
              if (currentHour > endHour || (currentHour === endHour && currentMinutes >= endMinutes)) {
                return; // Periodo ja passou
              }
            }
          }

          const [h1, m1] = periodo.horaInicio.split(":").map(Number);
          const [h2, m2] = periodo.horaFim.split(":").map(Number);
          let duracao = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
          if (duracao < 0) duracao += 24;

          periodosGaps.push({
            inicio: periodo.horaInicio,
            fim: periodo.horaFim,
            duracao,
            periodo: periodo.nome,
          });
        }
      });

      if (periodosGaps.length > 0) {
        gapsMap.set(dataStr, periodosGaps);
      }
    });

    return gapsMap;
  }, [turnos, currentDate]);

  const totalGaps = Array.from(gaps.values()).flat().length;

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleAddTurno = async (turno: Omit<Turno, "id">) => {
    try {
      const response = await fetch("/api/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(turno),
      });

      if (response.ok) {
        const novoTurno = await response.json();
        setTurnos([...turnos, novoTurno]);

        // Envia webhook com os dados da escala
        const acompanhante = acompanhantes.find(a => a.id === novoTurno.acompanhanteId);
        const webhookData = {
          ...novoTurno,
          acompanhante: acompanhante ? {
            id: acompanhante.id,
            nome: acompanhante.nome,
            telefone: acompanhante.telefone,
          } : null,
          createdAt: new Date().toISOString(),
        };

        fetch("https://n8n.harmonyservices.com.br/webhook/escalacontinue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookData),
        }).catch(err => console.error("Erro ao enviar webhook:", err));
      }
    } catch (error) {
      console.error("Erro ao adicionar turno:", error);
    }
  };

  const handleDeleteTurno = async (id: number) => {
    try {
      const response = await fetch(`/api/turnos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTurnos(turnos.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Erro ao remover turno:", error);
    }
  };

  const handleAddAcompanhante = async (nome: string, telefone?: string) => {
    try {
      const response = await fetch("/api/acompanhantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone: telefone || "" }),
      });

      if (response.ok) {
        const novoAcompanhante = await response.json();
        setAcompanhantes([...acompanhantes, novoAcompanhante]);
      }
    } catch (error) {
      console.error("Erro ao adicionar acompanhante:", error);
    }
  };

  const handleRemoveAcompanhante = async (id: number) => {
    try {
      const response = await fetch(`/api/acompanhantes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAcompanhantes(acompanhantes.filter((a) => a.id !== id));
        setTurnos(turnos.filter((t) => t.acompanhanteId !== id));
      }
    } catch (error) {
      console.error("Erro ao remover acompanhante:", error);
    }
  };

  const handleFillGap = (data: string, gap: Gap) => {
    setSelectedDate(new Date(data + "T00:00:00"));
    if (isMobile) {
      setMobileTab("escala");
    } else {
      setDesktopTab("escala");
    }
  };

  const handleAddRegistroAcompanhamento = async (registro: Omit<RegistroAcompanhamento, "id" | "createdAt">) => {
    try {
      const response = await fetch("/api/acompanhamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registro),
      });

      if (response.ok) {
        const novoRegistro = await response.json();
        setRegistrosAcompanhamento([...registrosAcompanhamento, novoRegistro]);
      }
    } catch (error) {
      console.error("Erro ao adicionar registro:", error);
    }
  };

  const handleDeleteRegistroAcompanhamento = async (id: number) => {
    try {
      const response = await fetch(`/api/acompanhamento/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRegistrosAcompanhamento(registrosAcompanhamento.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Erro ao remover registro:", error);
    }
  };

  const handleUpdateAcompanhante = async (id: number, data: Partial<Acompanhante>) => {
    try {
      const response = await fetch(`/api/acompanhantes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updated = await response.json();
        setAcompanhantes(acompanhantes.map((a) => (a.id === id ? updated : a)));
        if (selectedAcompanhante?.id === id) {
          setSelectedAcompanhante(updated);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar acompanhante:", error);
    }
  };

  const handleSelectAcompanhante = (acompanhante: Acompanhante) => {
    setSelectedAcompanhante(acompanhante);
    setShowAcompanhanteDetalhes(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mobile version
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <MobileHeader
          currentDate={currentDate}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onMenuClick={() => setMenuOpen(true)}
          gapsCount={totalGaps}
        />

        {/* Menu drawer */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 space-y-2">
              <button
                onClick={() => {
                  setMobileTab("escala");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Escala
              </button>
              <button
                onClick={() => {
                  setMobileTab("cobertura");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cobertura 24h
              </button>
              <button
                onClick={() => {
                  setMobileTab("pessoas");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Acompanhantes
              </button>
              <button
                onClick={() => {
                  setMobileTab("relatorio");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Resumo
              </button>
              <div className="border-t border-gray-200 my-4" />
              <button
                onClick={() => {
                  setMobileTab("acompanhamento");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <span className="text-indigo-600">Acompanhamento do Paciente</span>
              </button>

              {/* Backup section */}
              <div className="border-t border-gray-200 my-4" />
              <p className="px-4 text-xs text-gray-500 uppercase tracking-wider mb-2">
                Backup de Dados
              </p>
              <input
                ref={mobileFileInputRef}
                type="file"
                accept=".json"
                onChange={handleMobileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={handleMobileDownload}
                className="w-full justify-start px-4 py-3 h-auto font-normal"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Backup
              </Button>
              <Button
                variant="outline"
                onClick={() => mobileFileInputRef.current?.click()}
                disabled={mobileUploading}
                className="w-full justify-start px-4 py-3 h-auto font-normal mt-2"
              >
                {mobileUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Restaurar Backup
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          {mobileTab === "escala" && (
            <MobileEscalaView
              currentDate={currentDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              acompanhantes={acompanhantes}
              turnos={turnos}
              gaps={gaps}
              onAddTurno={handleAddTurno}
              onDeleteTurno={handleDeleteTurno}
            />
          )}

          {mobileTab === "cobertura" && (
            <MobileCoberturaView
              currentDate={currentDate}
              gaps={gaps}
              onFillGap={handleFillGap}
            />
          )}

          {mobileTab === "pessoas" && (
            <MobilePessoasView
              acompanhantes={acompanhantes}
              turnos={turnos}
              onAdd={handleAddAcompanhante}
              onRemove={handleRemoveAcompanhante}
              onSelect={handleSelectAcompanhante}
            />
          )}

          {mobileTab === "relatorio" && (
            <MobileRelatorioView
              acompanhantes={acompanhantes}
              turnos={turnos}
              registros={registrosAcompanhamento}
              onSelectAcompanhante={handleSelectAcompanhante}
            />
          )}

          {mobileTab === "acompanhamento" && (
            <MobileAcompanhamentoView
              registros={registrosAcompanhamento}
              onAdd={handleAddRegistroAcompanhamento}
              onDelete={handleDeleteRegistroAcompanhamento}
            />
          )}
        </main>

        {/* Modal de detalhes do acompanhante */}
        {showAcompanhanteDetalhes && selectedAcompanhante && (
          <MobileAcompanhanteDetalhes
            acompanhante={selectedAcompanhante}
            turnos={turnos.filter((t) => t.acompanhanteId === selectedAcompanhante.id)}
            registros={registrosAcompanhamento}
            onClose={() => {
              setShowAcompanhanteDetalhes(false);
              setSelectedAcompanhante(null);
            }}
            onUpdate={handleUpdateAcompanhante}
          />
        )}

        {/* Bottom navigation */}
        <MobileNav
          activeTab={mobileTab}
          onTabChange={setMobileTab}
          gapsCount={totalGaps}
        />
      </div>
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        currentDate={currentDate}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        activeTab={desktopTab}
        onTabChange={setDesktopTab}
        gapsCount={totalGaps}
        onDataRestore={handleDataRestore}
      />

      <div className="flex flex-1 overflow-hidden">
        {desktopTab === "escala" && (
          <Sidebar
            currentDate={currentDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            acompanhantes={acompanhantes}
            turnos={turnos}
            onAddTurno={handleAddTurno}
          />
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          {desktopTab === "escala" && (
            <>
              {/* Toolbar */}
              <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Escala Semanal
                </h2>
                <AcompanhantesManager
                  acompanhantes={acompanhantes}
                  onAdd={handleAddAcompanhante}
                  onRemove={handleRemoveAcompanhante}
                />
              </div>

              {/* Weekly schedule */}
              <WeeklySchedule
                currentDate={currentDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                acompanhantes={acompanhantes}
                turnos={turnos}
                gaps={gaps}
              />
            </>
          )}

          {desktopTab === "cobertura" && (
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Cobertura 24 Horas
                </h2>
                <p className="text-gray-600 mb-6">
                  Verifique os periodos que precisam de cobertura e preencha os
                  gaps para garantir atendimento 24h.
                </p>
                <CoverageGaps gaps={gaps} onFillGap={handleFillGap} />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-3xl font-bold text-primary">
                      {acompanhantes.length}
                    </div>
                    <div className="text-sm text-gray-500">Acompanhantes</div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {turnos.length}
                    </div>
                    <div className="text-sm text-gray-500">
                      Turnos Registrados
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-3xl font-bold text-red-500">
                      {totalGaps}
                    </div>
                    <div className="text-sm text-gray-500">Gaps na Semana</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {desktopTab === "pessoas" && (
            <DesktopPessoasView
              acompanhantes={acompanhantes}
              turnos={turnos}
              onAdd={handleAddAcompanhante}
              onRemove={handleRemoveAcompanhante}
              onSelect={handleSelectAcompanhante}
            />
          )}

          {desktopTab === "relatorio" && (
            <DesktopRelatorioView
              acompanhantes={acompanhantes}
              turnos={turnos}
              registros={registrosAcompanhamento}
              onSelectAcompanhante={handleSelectAcompanhante}
            />
          )}

          {desktopTab === "acompanhamento" && (
            <DesktopAcompanhamentoView
              registros={registrosAcompanhamento}
              onAdd={handleAddRegistroAcompanhamento}
              onDelete={handleDeleteRegistroAcompanhamento}
            />
          )}
        </main>
      </div>

      {/* Modal de detalhes do acompanhante desktop */}
      {showAcompanhanteDetalhes && selectedAcompanhante && (
        <DesktopAcompanhanteDetalhes
          acompanhante={selectedAcompanhante}
          turnos={turnos.filter((t) => t.acompanhanteId === selectedAcompanhante.id)}
          registros={registrosAcompanhamento}
          onClose={() => {
            setShowAcompanhanteDetalhes(false);
            setSelectedAcompanhante(null);
          }}
          onUpdate={handleUpdateAcompanhante}
        />
      )}
    </div>
  );
}
