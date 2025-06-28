"use client";

import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { FileSpreadsheet, Printer, Plus } from "lucide-react";

interface AppointmentsActionsProps {
  onExportExcel: () => void;
  onPrint: () => void;
  addButton?: React.ReactNode;
}

export function AppointmentsActions({
  onExportExcel,
  onPrint,
  addButton,
}: AppointmentsActionsProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center">
        <BackButton href="/dashboard" />
        <div>
          <h1 className="text-2xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground text-sm">
            Acesse uma visão detalhada de métricas principais e resultados dos
            pacientes
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {addButton}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>
    </div>
  );
}
