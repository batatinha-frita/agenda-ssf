"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import dayjs from "dayjs";
import Link from "next/link";

import { getOperationalData } from "@/actions/get-operational-data";
import { PageContainer } from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Clock,
  UserCheck,
  XCircle,
  Users,
  Filter,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Printer,
} from "lucide-react";

import { OccupationRateCard } from "./occupation-rate-card";
import { PopularHoursCard } from "./popular-hours-card";
import { AttendanceRateCard } from "./attendance-rate-card";
import { CancellationsCard } from "./cancellations-card";
import { DemographicsCard } from "./demographics-card";

interface Filters {
  from: string;
  to: string;
  doctorId: string;
}

export function OperationalDashboard() {
  const [filters, setFilters] = useState<Filters>({
    from: dayjs().subtract(30, "days").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
    doctorId: "",
  });
  const {
    execute: executeGetOperationalData,
    result,
    isExecuting,
  } = useAction(getOperationalData, {
    onSuccess: (result) => {
      console.log("Dados operacionais carregados com sucesso:", result?.data);
      if (result?.data) {
        toast.success("Relatórios carregados com sucesso!");
      }
    },
    onError: (error) => {
      console.error("Erro detalhado ao buscar dados operacionais:", error);
      toast.error("Erro ao carregar relatórios operacionais");
    },
  });

  // Carregar dados iniciais
  useEffect(() => {
    executeGetOperationalData(filters);
  }, []);
  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value === "all" ? "" : value,
    };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    executeGetOperationalData(filters);
  };

  const setQuickDate = (days: number) => {
    const newFilters = {
      ...filters,
      from: dayjs().subtract(days, "days").format("YYYY-MM-DD"),
      to: dayjs().format("YYYY-MM-DD"),
    };
    setFilters(newFilters);
    executeGetOperationalData(newFilters);
  };
  const operationalData = result?.data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Controles que não aparecem na impressão */}
        <div className="no-print mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/reports">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Relatórios Operacionais
              </h1>
              <p className="text-muted-foreground mt-2">
                Análise completa das operações da clínica: ocupação, horários
                populares, comparecimento e demografia
              </p>
            </div>
          </div>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Relatório
          </Button>
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
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Período De */}
              <div className="space-y-2">
                <Label htmlFor="from">Data Inicial</Label>
                <Input
                  id="from"
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleFilterChange("from", e.target.value)}
                />
              </div>

              {/* Período Até */}
              <div className="space-y-2">
                <Label htmlFor="to">Data Final</Label>
                <Input
                  id="to"
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleFilterChange("to", e.target.value)}
                />
              </div>

              {/* Médico */}
              <div className="space-y-2">
                <Label>Médico (Opcional)</Label>
                <Select
                  value={filters.doctorId}
                  onValueChange={(value) =>
                    handleFilterChange("doctorId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os médicos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os médicos</SelectItem>
                    {operationalData?.data?.clinicDoctors?.map(
                      (doctor: any) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ),
                    ) || []}
                  </SelectContent>
                </Select>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-2">
                <Label>Ações</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleApplyFilters}
                    disabled={isExecuting}
                    size="sm"
                  >
                    {isExecuting ? "Carregando..." : "Aplicar"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Botões de Período Rápido */}
            <div className="mt-4 flex flex-wrap gap-2">
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
          </CardContent>
        </Card>
        {/* Resumo Rápido */}
        {operationalData?.data && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Consultas
                </CardTitle>
                <Calendar className="text-muted-foreground h-4 w-4" />
              </CardHeader>{" "}
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
                  Médicos Ativos
                </CardTitle>
                <UserCheck className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {operationalData?.data?.clinicDoctors?.length || 0}
                </div>
                <p className="text-muted-foreground text-xs">Na clínica</p>
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
        {/* Cards de Relatórios */}
        {isExecuting ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
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
        ) : operationalData ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Taxa de Ocupação */}
            <div className="lg:col-span-2">
              <OccupationRateCard
                data={operationalData?.data?.doctorsOccupation || []}
              />
            </div>

            {/* Demografia */}
            <DemographicsCard
              data={(operationalData?.data?.patientsDemographics || []) as any}
            />

            {/* Horários Populares */}
            <PopularHoursCard
              data={operationalData?.data?.popularHours || []}
            />

            {/* Taxa de Comparecimento */}
            <AttendanceRateCard
              data={operationalData?.data?.appointmentsByStatus || []}
            />

            {/* Cancelamentos */}
            <CancellationsCard
              data={operationalData?.data?.cancellationsByDate || []}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="space-y-2 text-center">
                <BarChart3 className="text-muted-foreground mx-auto h-12 w-12" />
                <h3 className="text-lg font-medium">Nenhum dado encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou verificar se há consultas no
                  período selecionado.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
