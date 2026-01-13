"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, BarChart3, Activity, Download, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type DesktopTabType = "escala" | "cobertura" | "pessoas" | "relatorio" | "acompanhamento";

interface HeaderProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  activeTab: DesktopTabType;
  onTabChange: (tab: DesktopTabType) => void;
  gapsCount?: number;
  onDataRestore?: () => void;
}

export function Header({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  activeTab,
  onTabChange,
  gapsCount = 0,
  onDataRestore,
}: HeaderProps) {
  const mesAno = format(currentDate, "MMMM yyyy", { locale: ptBR });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleDownload = async () => {
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
    } catch (error) {
      console.error("Erro ao baixar backup:", error);
      alert("Erro ao baixar backup");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
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
        alert(`Dados restaurados com sucesso!\n\n${result.stats.acompanhantes} acompanhantes\n${result.stats.turnos} turnos\n${result.stats.registrosAcompanhamento} registros de acompanhamento`);
        onDataRestore?.();
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao restaurar backup:", error);
      alert("Erro ao restaurar backup. Verifique se o arquivo JSON e valido.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const tabs = [
    { id: "escala" as DesktopTabType, label: "Escala", icon: Calendar },
    { id: "cobertura" as DesktopTabType, label: "Cobertura 24h", icon: Clock, badge: gapsCount },
    { id: "pessoas" as DesktopTabType, label: "Acompanhantes", icon: Users },
    { id: "relatorio" as DesktopTabType, label: "Resumo", icon: BarChart3 },
    { id: "acompanhamento" as DesktopTabType, label: "Acompanhamento", icon: Activity },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-8 bg-primary rounded-sm" />
            <div className="w-2 h-8 bg-primary rounded-sm" />
            <div className="w-2 h-8 bg-primary rounded-sm" />
          </div>
          <span className="text-2xl font-bold text-gray-800 ml-2">escala</span>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousWeek}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium text-gray-700 capitalize min-w-[150px] text-center">
            {mesAno}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextWeek}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Backup buttons */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Backup
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Restaurar
          </Button>
        </div>
      </div>

      {/* Sub header with tabs */}
      <div className="flex items-center px-6 py-2 bg-gray-50 overflow-x-auto">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`min-w-[20px] h-5 flex items-center justify-center text-xs font-bold rounded-full px-1 ${
                    isActive ? "bg-white text-primary" : "bg-red-500 text-white"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
