"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import dayjs from "dayjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  Search,
  Printer,
} from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";
import {
  getRevenueReport,
  RevenueReportData,
} from "@/actions/get-revenue-report";
import { formatCurrencyInCents } from "@/helpers/currency";
import { RevenueChartInteractive } from "@/app/(protected)/reports/_components/revenue-chart-interactive";

interface Filters {
  from: string;
  to: string;
}

export function RevenueReportClient() {
  const [reportData, setReportData] = useState<RevenueReportData | null>(null);
  const [filters, setFilters] = useState<Filters>({
    from: dayjs().subtract(30, "days").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
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
        toast.error("Erro ao carregar dados de receitas");
      },
    },
  );

  useEffect(() => {
    executeGetRevenueReport({
      ...filters,
      doctorId: "",
    });
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    executeGetRevenueReport({
      ...filters,
      doctorId: "",
    });
  };

  const setQuickDate = (days: number) => {
    let newFilters;
    if (days === 0) {
      // Hoje
      newFilters = {
        from: dayjs().format("YYYY-MM-DD"),
        to: dayjs().format("YYYY-MM-DD"),
      };
    } else {
      newFilters = {
        from: dayjs().subtract(days, "days").format("YYYY-MM-DD"),
        to: dayjs().format("YYYY-MM-DD"),
      };
    }
    setFilters(newFilters);
    executeGetRevenueReport({
      ...newFilters,
      doctorId: "",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Dados mockados para demonstração quando não há dados reais
  const mockRevenueData: RevenueReportData = {
    summary: {
      totalRevenue: 4523000, // R$ 45.230,00 em centavos
      totalAppointments: 105,
      averageRevenue: 43076, // R$ 430,76 em centavos
      period: "Últimos 30 dias",
    },
    details: {
      byPeriod: [
        {
          date: "2025-01-20",
          revenue: 1050000, // R$ 10.500,00
          appointmentCount: 25,
        },
        {
          date: "2025-01-21",
          revenue: 840000, // R$ 8.400,00
          appointmentCount: 20,
        },
        {
          date: "2025-01-22",
          revenue: 1260000, // R$ 12.600,00
          appointmentCount: 30,
        },
        {
          date: "2025-01-23",
          revenue: 672000, // R$ 6.720,00
          appointmentCount: 16,
        },
        {
          date: "2025-01-24",
          revenue: 378000, // R$ 3.780,00
          appointmentCount: 9,
        },
        {
          date: "2025-01-25",
          revenue: 315000, // R$ 3.150,00
          appointmentCount: 5,
        },
      ],
      byDoctor: [
        {
          doctorId: "1",
          doctorName: "Dr. João Silva",
          totalRevenue: 1890000, // R$ 18.900,00
          appointmentCount: 45,
          averageRevenue: 42000, // R$ 420,00
        },
        {
          doctorId: "2",
          doctorName: "Dra. Ana Costa",
          totalRevenue: 1323000, // R$ 13.230,00
          appointmentCount: 30,
          averageRevenue: 44100, // R$ 441,00
        },
        {
          doctorId: "3",
          doctorName: "Dr. Carlos Oliveira",
          totalRevenue: 1310000, // R$ 13.100,00
          appointmentCount: 30,
          averageRevenue: 43666, // R$ 436,66
        },
      ],
      appointments: [
        {
          id: "1",
          patientName: "Maria Silva",
          patientPhone: "(11) 99999-0001",
          patientEmail: "maria@email.com",
          doctorName: "Dr. João Silva",
          appointmentDate: new Date("2025-01-25"),
          amount: 35000, // R$ 350,00
          paymentStatus: "paid" as const,
        },
        {
          id: "2",
          patientName: "João Santos",
          patientPhone: "(11) 99999-0002",
          patientEmail: "joao@email.com",
          doctorName: "Dra. Ana Costa",
          appointmentDate: new Date("2025-01-24"),
          amount: 28000, // R$ 280,00
          paymentStatus: "pending" as const,
        },
        {
          id: "3",
          patientName: "Pedro Lima",
          patientPhone: "(11) 99999-0003",
          patientEmail: "pedro@email.com",
          doctorName: "Dr. Carlos Oliveira",
          appointmentDate: new Date("2025-01-23"),
          amount: 42000, // R$ 420,00
          paymentStatus: "paid" as const,
        },
      ],
    },
    clinicName: "Clínica Médica Demo",
  };

  const currentReportData = reportData || mockRevenueData;

  const filteredAppointments = () => {
    if (!searchTerm) return currentReportData.details.appointments;
    return currentReportData.details.appointments.filter(
      (appointment) =>
        appointment.patientName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.doctorName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()),
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

  const formatDate = (date: Date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  // Preparar dados para o gráfico
  const prepareChartData = () => {
    if (!currentReportData) return [];

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
    currentReportData.details.byPeriod.forEach((period) => {
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
      <PageContainer>
        <div className="space-y-6">
          <div className="no-print flex items-start justify-between gap-6">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold">
                <DollarSign className="h-8 w-8 text-green-600" />
                Relatório de Receita por Período
              </h1>
              <p className="text-muted-foreground mt-2">
                Análise detalhada da receita gerada por médicos e consultas
              </p>
            </div>
          </div>

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
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Cabeçalho com controles */}
        <div className="no-print flex items-start justify-between gap-6">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <DollarSign className="h-8 w-8 text-green-600" />
              Relatório de Receita por Período
            </h1>
            <p className="text-muted-foreground mt-2">
              Análise detalhada da receita gerada por médicos e consultas
            </p>
          </div>

          {/* Filtros inline */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="from-inline"
                className="text-sm whitespace-nowrap"
              >
                Data Inicial
              </Label>
              <Input
                id="from-inline"
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange("from", e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="to-inline" className="text-sm whitespace-nowrap">
                Data Final
              </Label>
              <Input
                id="to-inline"
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange("to", e.target.value)}
                className="w-auto"
              />
            </div>
            <Button
              onClick={handleApplyFilters}
              disabled={isExecuting}
              size="sm"
            >
              {isExecuting ? "Carregando..." : "Aplicar"}
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Botões de período rápido - Centralizados */}
        <div className="no-print flex justify-center">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDate(0)}
              disabled={isExecuting}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDate(2)}
              disabled={isExecuting}
            >
              Últimos 2 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDate(7)}
              disabled={isExecuting}
            >
              Últimos 7 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDate(30)}
              disabled={isExecuting}
            >
              Últimos 30 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickDate(90)}
              disabled={isExecuting}
            >
              Últimos 90 dias
            </Button>
          </div>
        </div>

        {/* Header para impressão */}
        <div className="print-only hidden">
          <div className="mb-6 flex items-start justify-between border-b-2 border-gray-800 pb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {currentReportData.clinicName}
              </h1>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold text-gray-800">
                Relatório de Receitas
              </h2>
              <p className="text-sm text-gray-600">
                Gerado em: {new Date().toLocaleDateString("pt-BR")}
              </p>
              <p className="text-sm text-gray-600">
                Período: {dayjs(filters.from).format("DD/MM/YYYY")} -{" "}
                {dayjs(filters.to).format("DD/MM/YYYY")}
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrencyInCents(currentReportData.summary.totalRevenue)}
              </div>
              <p className="text-muted-foreground text-xs">
                {currentReportData.summary.period}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Consultas
              </CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {currentReportData.summary.totalAppointments}
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
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrencyInCents(
                  currentReportData.summary.averageRevenue,
                )}
              </div>
              <p className="text-muted-foreground text-xs">por consulta</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Médicos Ativos
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {currentReportData.details.byDoctor.length}
              </div>
              <p className="text-muted-foreground text-xs">
                médicos com receita
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico Interativo */}
        <RevenueChartInteractive
          data={prepareChartData()}
          activeChart={activeChart}
          onActiveChartChange={setActiveChart}
        />

        {/* Tabelas com Tabs */}
        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors">
              Por Médico ({currentReportData.details.byDoctor.length})
            </TabsTrigger>
            <TabsTrigger value="appointments">
              Consultas ({currentReportData.details.appointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Receita por Médico</CardTitle>
              </CardHeader>
              <CardContent>
                {currentReportData.details.byDoctor.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Médico</TableHead>
                          <TableHead>Total de Consultas</TableHead>
                          <TableHead>Receita Total</TableHead>
                          <TableHead>Receita Média</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentReportData.details.byDoctor
                          .sort((a, b) => b.totalRevenue - a.totalRevenue)
                          .map((doctor, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {capitalizeName(doctor.doctorName)}
                              </TableCell>
                              <TableCell>{doctor.appointmentCount}</TableCell>
                              <TableCell className="font-medium text-green-600">
                                {formatCurrencyInCents(doctor.totalRevenue)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrencyInCents(doctor.averageRevenue)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    Nenhum dado de receita por médico encontrado.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Consultas Detalhadas</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      placeholder="Buscar paciente ou médico..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAppointments().length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Médico</TableHead>
                          <TableHead>Data Consulta</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments()
                          .sort(
                            (a, b) =>
                              dayjs(b.appointmentDate).unix() -
                              dayjs(a.appointmentDate).unix(),
                          )
                          .map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell className="font-medium">
                                {capitalizeName(appointment.patientName)}
                              </TableCell>
                              <TableCell>
                                {capitalizeName(appointment.doctorName)}
                              </TableCell>
                              <TableCell>
                                {formatDate(appointment.appointmentDate)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrencyInCents(appointment.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    appointment.paymentStatus === "paid"
                                      ? "default"
                                      : appointment.paymentStatus === "pending"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className={
                                    appointment.paymentStatus === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : appointment.paymentStatus === "pending"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-red-100 text-red-800"
                                  }
                                >
                                  {appointment.paymentStatus === "paid"
                                    ? "Pago"
                                    : appointment.paymentStatus === "pending"
                                      ? "Pendente"
                                      : "Em Atraso"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    {searchTerm
                      ? "Nenhum resultado encontrado para a pesquisa."
                      : "Nenhuma consulta encontrada."}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
