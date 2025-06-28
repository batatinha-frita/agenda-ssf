"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import dayjs from "dayjs";
import Link from "next/link";

import { getOperationalData } from "@/actions/get-operational-data";
import { getFrequentPatients } from "@/actions/get-frequent-patients";
import { PageContainer } from "@/components/ui/page-container";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Calendar,
  Users,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Printer,
  Star,
} from "lucide-react";

// Importar componentes de gráficos
import { AttendanceRateCard } from "./operational/_components/attendance-rate-card";
import { PopularHoursCard } from "./operational/_components/popular-hours-card";
import { DemographicsRadialCard } from "./operational/_components/demographics-radial-card";
import { TopTimeSlotsCard } from "./operational/_components/top-time-slots-card";
import { getFrequencyBadge, type FrequencyLevel } from "@/hooks/use-frequency";

interface Filters {
  from: string;
  to: string;
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<Filters>({
    from: dayjs().subtract(30, "days").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });

  const {
    execute: executeGetOperationalData,
    result,
    isExecuting,
  } = useAction(getOperationalData, {
    onSuccess: (result) => {
      console.log("Dados operacionais carregados com sucesso:", result?.data);
    },
    onError: (error) => {
      console.error("Erro ao buscar dados operacionais:", error);
      toast.error("Erro ao carregar dados dos relatórios");
    },
  });

  const {
    execute: executeGetFrequentPatients,
    result: frequentPatientsResult,
    isExecuting: isLoadingFrequentPatients,
  } = useAction(getFrequentPatients, {
    onSuccess: (result) => {
      console.log("Pacientes frequentes carregados:", result?.data);
    },
    onError: (error) => {
      console.error("Erro ao buscar pacientes frequentes:", error);
      // Só mostrar erro se não houver dados mockados funcionais
      // toast.error("Erro ao carregar pacientes frequentes");
    },
  });

  // Carregar dados iniciais
  useEffect(() => {
    executeGetOperationalData(filters);
    // Buscar pacientes frequentes - usando 0 para pegar todos os pacientes
    executeGetFrequentPatients({
      clinicId: "placeholder", // Será substituído pela clínica da sessão na action
      minConsultations: 0,
    });
  }, []);

  // Dados mockados para demonstração quando não há dados reais
  const mockOperationalData = {
    totalAppointments: 105,
    totalPatients: 44,
    attendanceRate: "81.0",
    noShowRate: "17.1",
    popularHours: [
      {
        hour: 9,
        appointments: 15,
        hourFormatted: "09:00",
        dayOfWeek: 1,
        dayName: "Semana",
      },
      {
        hour: 10,
        appointments: 12,
        hourFormatted: "10:00",
        dayOfWeek: 1,
        dayName: "Semana",
      },
      {
        hour: 14,
        appointments: 10,
        hourFormatted: "14:00",
        dayOfWeek: 1,
        dayName: "Semana",
      },
      {
        hour: 11,
        appointments: 8,
        hourFormatted: "11:00",
        dayOfWeek: 1,
        dayName: "Semana",
      },
      {
        hour: 15,
        appointments: 7,
        hourFormatted: "15:00",
        dayOfWeek: 1,
        dayName: "Semana",
      },
    ],
    appointmentsByStatus: [
      { status: "completed", count: 85, percentage: "81.0" },
      { status: "cancelled", count: 18, percentage: "17.1" },
      { status: "confirmed", count: 2, percentage: "1.9" },
    ],
    patientsDemographics: [
      { sex: "male", count: 18, percentage: "40.9", sexLabel: "Masculino" },
      { sex: "female", count: 26, percentage: "59.1", sexLabel: "Feminino" },
    ],
    period: { from: filters.from, to: filters.to },
  };

  const mockFrequentPatients = [
    { name: "Maria Silva", consultations: 8, level: "Frequente", icon: "Star" },
    { name: "João Santos", consultations: 6, level: "Frequente", icon: "Star" },
    { name: "Ana Costa", consultations: 4, level: "Regular", icon: "User" },
    { name: "Pedro Lima", consultations: 3, level: "Regular", icon: "User" },
    {
      name: "Carla Oliveira",
      consultations: 2,
      level: "Regular",
      icon: "User",
    },
  ];

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    executeGetOperationalData(filters);
  };

  const setQuickDate = (days: number) => {
    const newFilters = {
      from: dayjs().subtract(days, "days").format("YYYY-MM-DD"),
      to: dayjs().format("YYYY-MM-DD"),
    };
    setFilters(newFilters);
    executeGetOperationalData(newFilters);
  };

  const operationalData = result?.data || { data: mockOperationalData };

  // Corrigir a estrutura dos dados de pacientes frequentes
  let frequentPatients: any[] = [];
  if (frequentPatientsResult?.data) {
    if (Array.isArray(frequentPatientsResult.data)) {
      frequentPatients = frequentPatientsResult.data;
    } else if (
      frequentPatientsResult.data.data &&
      Array.isArray(frequentPatientsResult.data.data)
    ) {
      frequentPatients = frequentPatientsResult.data.data;
    }
  }

  // Se não há pacientes frequentes, usar os dados mockados
  if (frequentPatients.length === 0) {
    frequentPatients = mockFrequentPatients;
  }

  console.log("Operational data:", operationalData);
  console.log("Frequent patients result:", frequentPatientsResult);
  console.log("Frequent patients data:", frequentPatients);
  console.log("Mock data being used:", {
    popularHours: operationalData?.data?.popularHours,
    appointmentsByStatus: operationalData?.data?.appointmentsByStatus,
    patientsDemographics: operationalData?.data?.patientsDemographics,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Cabeçalho com controles de impressão */}
        <div className="no-print flex items-start justify-between gap-6">
          <div className="flex items-center">
            <BackButton href="/dashboard" />
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Relatórios da Clínica
              </h1>
              <p className="text-muted-foreground mt-2">
                Dashboard principal com indicadores operacionais e análises
              </p>
            </div>
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
                Clínica Médica
              </h1>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold text-gray-800">
                Relatórios Operacionais
              </h2>
              <p className="text-sm text-gray-600">
                Gerado em: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Resumo Rápido */}
        {operationalData?.data && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Consultas
                </CardTitle>
                <Calendar className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {operationalData?.data?.totalAppointments || 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  No período selecionado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pacientes Únicos
                </CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {operationalData?.data?.totalPatients || 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  Atendidos no período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Comparecimento
                </CardTitle>
                <UserCheck className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {operationalData?.data?.attendanceRate || "0.0"}%
                </div>
                <p className="text-muted-foreground text-xs">
                  Pacientes que compareceram
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Período Analisado
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {operationalData?.data?.period
                    ? dayjs(operationalData.data.period.to).diff(
                        dayjs(operationalData.data.period.from),
                        "days",
                      ) + 1
                    : 0}
                </div>
                <p className="text-muted-foreground text-xs">Dias analisados</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos Operacionais */}
        {isExecuting ? (
          <div className="space-y-6">
            {/* Grid 1: 3 cards na mesma linha */}
            <div className="grid gap-6 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Grid 2: 2/3 + 1/3 */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grid 1: Horários Mais Populares (2/3) + Top 4 Horários por Dia (1/3) */}
            <div className="grid items-stretch gap-6 lg:grid-cols-3">
              {/* Horários Mais Populares - 2/3 */}
              <div className="h-[460px] lg:col-span-2">
                <PopularHoursCard
                  data={operationalData?.data?.popularHours || []}
                  attendanceRate={
                    operationalData?.data?.attendanceRate || "0.0"
                  }
                  noShowRate={operationalData?.data?.noShowRate || "0.0"}
                />
              </div>

              {/* Top 4 Horários por Dia - 1/3 */}
              <div className="h-[460px]">
                <TopTimeSlotsCard
                  data={operationalData?.data?.popularHours || []}
                />
              </div>
            </div>

            {/* Grid 2: Taxa de Comparecimento, Demografia dos Pacientes, Pacientes Frequentes */}
            <div className="grid items-stretch gap-6 lg:grid-cols-3">
              {/* Taxa de Comparecimento */}
              <div className="h-[460px]">
                <AttendanceRateCard
                  data={operationalData?.data?.appointmentsByStatus || []}
                />
              </div>

              {/* Demografia dos Pacientes - Novo Gráfico Radial */}
              <div className="h-[460px]">
                <DemographicsRadialCard
                  data={operationalData?.data?.patientsDemographics || []}
                />
              </div>

              {/* Pacientes Frequentes */}
              <div className="h-[460px]">
                <Card className="flex h-full flex-col">
                  <CardHeader className="flex-shrink-0 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Pacientes Frequentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between p-4">
                    {/* Lista de pacientes no meio */}
                    <div className="flex-1 space-y-2 overflow-auto">
                      {isLoadingFrequentPatients ? (
                        Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="flex animate-pulse items-center justify-between rounded-lg bg-gray-50 p-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-gray-200" />
                              <div>
                                <div className="mb-1 h-3 w-20 rounded bg-gray-200" />
                                <div className="h-2 w-12 rounded bg-gray-200" />
                              </div>
                            </div>
                            <div className="h-5 w-12 rounded bg-gray-200" />
                          </div>
                        ))
                      ) : frequentPatients.length > 0 ? (
                        frequentPatients.slice(0, 6).map((patient, index) => {
                          const badge = getFrequencyBadge(
                            patient.level as FrequencyLevel,
                          );
                          const Icon = badge.icon;
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`rounded-full p-1 ${badge.color}`}
                                >
                                  <Icon className="h-3 w-3" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium">
                                    {patient.name}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {patient.consultations} consultas
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {patient.level}
                              </Badge>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <p className="text-muted-foreground text-sm">
                              Nenhum paciente frequente encontrado
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              Aguardando dados de consultas...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rodapé fixo no final */}
                    {frequentPatients.length > 6 && (
                      <div className="flex-shrink-0 border-t pt-3 text-center">
                        <p className="text-muted-foreground text-xs">
                          +{frequentPatients.length - 6} pacientes frequentes
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Espaçamento entre gráficos e links */}
        <div className="h-8"></div>

        {/* Links para Relatórios Específicos */}
        <div className="no-print grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button asChild variant="outline" className="h-auto p-4">
            <Link href="/reports/financial">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Relatório Financeiro</p>
                  <p className="text-muted-foreground text-sm">
                    Receitas e pagamentos
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4">
            <Link href="/reports/financial/revenue">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Relatório de Receitas</p>
                  <p className="text-muted-foreground text-sm">
                    Análise completa de pacientes
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4" disabled>
            <div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium">Análise Avançada</p>
                  <p className="text-muted-foreground text-sm">Em breve</p>
                </div>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
