import { Metadata } from "next";
import { PaymentsReportClient } from "./_components/payments-report-client";

export const metadata: Metadata = {
  title: "Relatório de Pagamentos",
  description: "Análise de pagamentos: clientes em atraso, aberto e pagos",
};

export default function PaymentsReportPage() {
  return <PaymentsReportClient />;
}
