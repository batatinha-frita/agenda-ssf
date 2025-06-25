"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Calendar, TrendingUp, Users, Search } from "lucide-react";
import { PrintLayout } from "@/app/(protected)/reports/_components/print-layout";
import {
  getRevenueReport,
  RevenueReportData,
} from "@/actions/get-revenue-report";
import { formatCurrencyInCents } from "@/helpers/currency";
import dayjs from "dayjs";
import { RevenueChartInteractive } from "@/app/(protected)/reports/_components/revenue-chart-interactive";
import { DatePicker } from "@/app/(protected)/reports/_components/date-picker";

export function RevenueReportClient() {
  const [reportData, setReportData] = useState<RevenueReportData | null>(null);
  const [filters, setFilters] = useState({
    from: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    to: dayjs().add(7, "days").format("YYYY-MM-DD"),
    doctorId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChart, setActiveChart] = useState<"revenue" | "appointments">(
    "revenue",
  );

  const { execute: executeGetRevenueReport, isExecuting } = useAction(
    getRevenueReport,
    {
      onSuccess: (result) => {
        if (result.data) {
          setReportData(result.data);
        }
      },
      onError: (error) => {
        console.error("Erro ao buscar relatório:", error);
      },
    },
  );

  useEffect(() => {
    executeGetRevenueReport(filters);
  }, [filters, executeGetRevenueReport]);

  const handleDateChange = (from: string, to: string) => {
    setFilters((prev) => ({ ...prev, from, to }));
  };

  const filteredData = (data: any[]) => {
    if (!searchTerm) return data;
    return data.filter(
      (item) =>
        item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  // Função para capitalizar nomes (primeira letra de cada palavra maiúscula)
  const capitalizeName = (name: string) => {
    return (
      name
        ?.toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") || ""
    );
  };

  // Função para normalizar email (sempre minúsculo)
  const normalizeEmail = (email: string) => {
    return email?.toLowerCase() || "";
  };

  const formatDate = (date: Date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  // Preparar dados para o gráfico
  const prepareChartData = () => {
    if (!reportData) return [];

    const dailyData: {
      [key: string]: { revenue: number; appointments: number };
    } = {};

    // Inicializar dados para cada dia no período
    const startDate = dayjs(filters.from);
    const endDate = dayjs(filters.to);
    let currentDate = startDate;

    while (currentDate.isSame(endDate) || currentDate.isBefore(endDate)) {
      const dateKey = currentDate.format("YYYY-MM-DD");
      dailyData[dateKey] = { revenue: 0, appointments: 0 };
      currentDate = currentDate.add(1, "day");
    }

    // Preencher com dados reais
    reportData.details.byPeriod.forEach((period) => {
      if (dailyData[period.date]) {
        dailyData[period.date].revenue = period.revenue;
        dailyData[period.date].appointments = period.appointmentCount;
      }
    });

    return Object.entries(dailyData).map(([date, values]) => ({
      date,
      ...values,
    }));
  };

  if (isExecuting) {
    return (
      <PrintLayout
        title="Relatório de Receita por Período"
        description="Carregando dados..."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="mb-2 h-8 w-32" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </PrintLayout>
    );
  }

  if (!reportData) {
    return (
      <PrintLayout
        title="Relatório de Receita por Período"
        description="Nenhum dado encontrado"
      >
        <div className="py-8 text-center">
          <p>Nenhum dado encontrado para o período selecionado.</p>
        </div>
      </PrintLayout>
    );
  }

  return (
    <PrintLayout
      title="Relatório de Receita por Período"
      description="Análise detalhada da receita por período, médicos e consultas"
      clinicInfo={{
        name: reportData.clinicName,
      }}
      actions={
        /* Filtros de data no cabeçalho - Estilo dashboard */
        <DatePicker
          from={filters.from}
          to={filters.to}
          onDateChange={handleDateChange}
          className="no-print"
        />
      }
    >
      <div className="reports-layout">
        {/* Cards de Resumo */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrencyInCents(reportData.summary.totalRevenue)}
              </div>
              <p className="text-muted-foreground text-xs">
                {reportData.summary.period}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Consultas
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {reportData.summary.totalAppointments}
              </div>
              <p className="text-muted-foreground text-xs">
                consultas realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Média
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrencyInCents(reportData.summary.averageRevenue)}
              </div>
              <p className="text-muted-foreground text-xs">por consulta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Médicos Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {reportData.details.byDoctor.length}
              </div>
              <p className="text-muted-foreground text-xs">
                médicos com receita
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Distribuição - Fixo no topo */}
        <div className="reports-chart-section">
          <RevenueChartInteractive
            data={prepareChartData()}
            activeChart={activeChart}
            onActiveChartChange={setActiveChart}
          />
        </div>

        {/* Dados detalhados - Com scroll */}
        <div className="reports-tables-section">
          <Tabs defaultValue="doctors" className="reports-tabs-container">
            <TabsList className="no-print flex-shrink-0">
              <TabsTrigger value="doctors">
                Por Médico ({reportData.details.byDoctor.length})
              </TabsTrigger>
              <TabsTrigger value="appointments">
                Consultas ({reportData.details.appointments.length})
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo das tabs com scroll */}
            <div className="reports-tabs-content">
              <TabsContent value="doctors" className="mt-4 h-full">
                <div className="avoid-break">
                  {/* Título e busca na mesma linha */}
                  <div className="report-section-header">
                    <h3 className="report-section-title">Receita por Médico</h3>
                  </div>

                  {reportData.details.byDoctor.length > 0 ? (
                    <div className="report-table-wrapper">
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Médico</th>
                            <th>Total de Consultas</th>
                            <th>Receita Total</th>
                            <th>Receita Média</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.details.byDoctor
                            .sort((a, b) => b.totalRevenue - a.totalRevenue)
                            .map((doctor, index) => (
                              <tr key={index}>
                                <td>{capitalizeName(doctor.doctorName)}</td>
                                <td>{doctor.appointmentCount}</td>
                                <td className="font-medium text-green-600">
                                  {formatCurrencyInCents(doctor.totalRevenue)}
                                </td>
                                <td className="font-medium">
                                  {formatCurrencyInCents(doctor.averageRevenue)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="report-empty-state">
                      Nenhum dado de receita por médico encontrado.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="appointments" className="mt-4 h-full">
                <div className="avoid-break">
                  {/* Título e busca na mesma linha */}
                  <div className="report-section-header">
                    <h3 className="report-section-title">
                      Consultas Detalhadas
                    </h3>
                    {/* Campo de busca */}
                    <div className="no-print report-search-wrapper">
                      <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                      <Input
                        placeholder="Buscar paciente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="report-search-input"
                      />
                    </div>
                  </div>

                  {filteredData(reportData.details.appointments).length > 0 ? (
                    <div className="report-table-wrapper">
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Paciente</th>
                            <th>Médico</th>
                            <th>Data Consulta</th>
                            <th>Valor</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData(reportData.details.appointments)
                            .sort(
                              (a, b) =>
                                dayjs(b.appointmentDate).unix() -
                                dayjs(a.appointmentDate).unix(),
                            )
                            .map((appointment) => (
                              <tr key={appointment.id}>
                                <td>
                                  {capitalizeName(appointment.patientName)}
                                </td>
                                <td>
                                  {capitalizeName(appointment.doctorName)}
                                </td>
                                <td>
                                  {formatDate(appointment.appointmentDate)}
                                </td>
                                <td className="font-medium">
                                  {formatCurrencyInCents(appointment.amount)}
                                </td>
                                <td>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                      appointment.paymentStatus === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : appointment.paymentStatus ===
                                            "pending"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {appointment.paymentStatus === "paid"
                                      ? "Pago"
                                      : appointment.paymentStatus === "pending"
                                        ? "Pendente"
                                        : "Em Atraso"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="report-empty-state">
                      Nenhuma consulta encontrada.
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </PrintLayout>
  );
}
