import { Metadata } from "next";
import { RevenueReportClient } from "./_components/revenue-report-client";

export const metadata: Metadata = {
  title: "Relatório de Receita por Período",
  description: "Análise temporal de receitas e performance financeira",
};

export default function RevenueReportPage() {
  return <RevenueReportClient />;
}
