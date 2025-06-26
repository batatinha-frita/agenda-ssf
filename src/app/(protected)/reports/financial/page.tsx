"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import dayjs from "dayjs";
import Link from "next/link";

import { getPaymentsReport } from "@/actions/get-payments-report";
import { PageContainer } from "@/components/ui/page-container";
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
  DollarSign,
  TrendingUp,
  Printer,
} from "lucide-react";

// Importar componentes específicos do relatório financeiro
import {
  PaymentStatusChart,
  PaymentsTable,
  PaymentsChartInteractive,
} from "./_components";

interface Filters {
  from: string;
  to: string;
}

export default function FinancialReportsPage() {
  const [filters, setFilters] = useState<Filters>({
    from: dayjs().subtract(30, "days").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });
  const [activeChart, setActiveChart] = useState<
    "totalGenerated" | "paid" | "pending" | "overdue"
  >("totalGenerated");

  const {
    execute: executeGetPaymentsReport,
    result,
    isExecuting,
  } = useAction(getPaymentsReport, {
    onSuccess: (result) => {
      console.log("Dados de pagamentos carregados com sucesso:", result?.data);
    },
    onError: (error) => {
      console.error("Erro ao buscar dados de pagamentos:", error);
      // toast.error("Erro ao carregar dados financeiros");
    },
  });

  // Carregar dados iniciais
  useEffect(() => {
    executeGetPaymentsReport({
      ...filters,
      paymentStatus: "all",
    });
  }, []);

  // Dados mockados para demonstração quando não há dados reais
  const mockPaymentsData = {
    summary: {
      totalPaid: 2878000, // R$ 28.780,00 em centavos
      totalPending: 1245000, // R$ 12.450,00 em centavos
      totalOverdue: 400000, // R$ 4.000,00 em centavos
      totalAppointments: 105,
      countPaid: 67,
      countPending: 23,
      countOverdue: 15,
    },
    details: {
      paid: [
        {
          id: "1",
          patientName: "Maria Silva",
          patientPhone: "(11) 99999-9999",
          patientEmail: "maria@email.com",
          doctorName: "Dr. João",
          doctorSpecialty: "Cardiologista",
          appointmentDate: new Date("2025-06-20"),
          amount: 35000, // R$ 350,00
          paymentStatus: "paid" as const,
          paymentDate: new Date("2025-06-20"),
        },
      ],
      pending: [
        {
          id: "2",
          patientName: "João Santos",
          patientPhone: "(11) 88888-8888",
          patientEmail: "joao@email.com",
          doctorName: "Dr. Ana",
          doctorSpecialty: "Dermatologista",
          appointmentDate: new Date("2025-06-25"),
          amount: 28000, // R$ 280,00
          paymentStatus: "pending" as const,
        },
      ],
      overdue: [
        {
          id: "3",
          patientName: "Pedro Lima",
          patientPhone: "(11) 77777-7777",
          patientEmail: "pedro@email.com",
          doctorName: "Dr. Carlos",
          doctorSpecialty: "Ortopedista",
          appointmentDate: new Date("2025-06-10"),
          amount: 42000, // R$ 420,00
          paymentStatus: "overdue" as const,
          daysOverdue: 15,
        },
      ],
    },
    allDetails: {
      paid: [],
      pending: [],
      overdue: [],
    },
    clinicName: "Clínica Médica Demo",
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    executeGetPaymentsReport({
      ...filters,
      paymentStatus: "all",
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
    executeGetPaymentsReport({
      ...newFilters,
      paymentStatus: "all",
    });
  };

  const paymentsData = result?.data || mockPaymentsData;

  // Calcular métricas
  const totalGenerated =
    paymentsData.summary.totalPaid +
    paymentsData.summary.totalPending +
    paymentsData.summary.totalOverdue;

  const averagePerAppointment =
    paymentsData.summary.totalAppointments > 0
      ? totalGenerated / paymentsData.summary.totalAppointments
      : 0;

  const periodDays = dayjs(filters.to).diff(dayjs(filters.from), "days") + 1;

  const handlePrint = () => {
    window.print();
  };

  // Preparar dados para o gráfico interativo
  const prepareChartData = () => {
    const dailyData: {
      [key: string]: {
        totalPaid: number;
        totalPending: number;
        totalOverdue: number;
        totalGenerated: number;
      };
    } = {};

    // Inicializar dados para cada dia no período
    const startDate = dayjs(filters.from);
    const endDate = dayjs(filters.to);
    let currentDate = startDate;

    while (currentDate.isSame(endDate) || currentDate.isBefore(endDate)) {
      const dateKey = currentDate.format("YYYY-MM-DD");
      dailyData[dateKey] = {
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalGenerated: 0,
      };
      currentDate = currentDate.add(1, "day");
    }

    // Simular distribuição dos dados pelos dias (já que não temos dados reais por dia)
    // Em uma implementação real, você buscaria os dados agrupados por dia
    const days = Object.keys(dailyData);
    if (days.length > 0) {
      const dailyPaid = paymentsData.summary.totalPaid / days.length;
      const dailyPending = paymentsData.summary.totalPending / days.length;
      const dailyOverdue = paymentsData.summary.totalOverdue / days.length;

      days.forEach((dateKey, index) => {
        // Adicionar alguma variação nos dados para tornar o gráfico mais interessante
        const variation = Math.sin(index * 0.5) * 0.3 + 1;
        dailyData[dateKey] = {
          totalPaid: Math.round(dailyPaid * variation),
          totalPending: Math.round(dailyPending * variation),
          totalOverdue: Math.round(dailyOverdue * variation),
          totalGenerated: Math.round(
            (dailyPaid + dailyPending + dailyOverdue) * variation,
          ),
        };
      });
    }

    return Object.entries(dailyData).map(([date, values]) => ({
      date,
      ...values,
    }));
  };

  console.log("Payments data:", paymentsData);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Cabeçalho com controles de impressão */}
        <div className="no-print flex items-start justify-between gap-6">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Relatórios da Clínica
            </h1>
            <p className="text-muted-foreground mt-2">
              Dashboard principal com indicadores operacionais e análises
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
                {paymentsData.clinicName}
              </h1>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold text-gray-800">
                Relatório Financeiro
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

        {/* Resumo Rápido */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Consultas
              </CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentsData.summary.totalAppointments}
              </div>
              <p className="text-muted-foreground text-xs">
                Atendimentos realizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Valor Médio por Consulta
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(averagePerAppointment / 100)}
              </div>
              <p className="text-muted-foreground text-xs">Ticket médio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dias em Análise
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{periodDays}</div>
              <p className="text-muted-foreground text-xs">Período analisado</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico Interativo de Pagamentos */}
        <PaymentsChartInteractive
          data={prepareChartData()}
          activeChart={activeChart}
          onActiveChartChange={setActiveChart}
        />

        {/* Tabela de Pagamentos */}
        <PaymentsTable data={paymentsData.details} isLoading={isExecuting} />
      </div>
    </PageContainer>
  );
}
