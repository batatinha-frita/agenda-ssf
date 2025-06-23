import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PrintLayoutProps {
  title: string;
  description?: string;
  backUrl?: string;
  children: ReactNode;
  actions?: ReactNode; // Para filtros personalizados
  clinicInfo?: {
    name: string;
    address?: string;
    phone?: string;
  };
}

export function PrintLayout({
  title,
  description,
  backUrl = "/reports",
  children,
  actions, // Receber ações personalizadas
  clinicInfo = {
    name: "Clínica Médica",
    address: "Endereço da Clínica",
    phone: "(00) 0000-0000",
  },
}: PrintLayoutProps) {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      {" "}
      {/* Controles que não aparecem na impressão */}
      <div className="no-print mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={backUrl}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Ações personalizadas (filtros) */}
          {actions}
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Relatório
          </Button>
        </div>
      </div>
      {/* Container para impressão */}
      <div className="print-container">
        {/* Cabeçalho para impressão */}
        <div className="print-header print-only hidden">
          <div className="mb-6 flex items-start justify-between border-b-2 border-gray-800 pb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {clinicInfo.name}
              </h1>
              {clinicInfo.address && (
                <p className="text-sm text-gray-600">{clinicInfo.address}</p>
              )}
              {clinicInfo.phone && (
                <p className="text-sm text-gray-600">{clinicInfo.phone}</p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-600">Gerado em: {currentDate}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo do relatório */}
        <div className="print-content space-y-6">{children}</div>

        {/* Rodapé para impressão */}
        <div className="print-footer print-only hidden">
          <div className="mt-8 border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
            <p>Relatório gerado automaticamente em {currentDate}</p>
          </div>
        </div>
      </div>
    </>
  );
}
