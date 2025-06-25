import { Metadata } from "next";
import { OperationalDashboard } from "./_components/operational-dashboard";

export const metadata: Metadata = {
  title: "Relatórios Operacionais",
  description:
    "Análise operacional completa da clínica: ocupação, horários, comparecimento e demografia",
};

export default function OperationalReportsPage() {
  return <OperationalDashboard />;
}
