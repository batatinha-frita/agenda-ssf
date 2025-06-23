"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
} from "lucide-react";
import { PrintLayout } from "@/app/(protected)/reports/_components/print-layout";
import {
  getPaymentsReport,
  PaymentsReportData,
} from "@/actions/get-payments-report";
import { formatCurrencyInCents } from "@/helpers/currency";
import dayjs from "dayjs";
import { BarChartInteractive } from "@/app/(protected)/reports/_components/bar-chart-interactive";
import { DatePicker } from "@/app/(protected)/reports/_components/date-picker";

export function PaymentsReportClient() {
  const [reportData, setReportData] = useState<PaymentsReportData | null>(null);
  const [filters, setFilters] = useState({
    from: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    to: dayjs().add(7, "days").format("YYYY-MM-DD"),
    doctorId: "",
    paymentStatus: "all" as "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChart, setActiveChart] = useState<
    "all" | "paid" | "pending" | "overdue"
  >("all");
  const { execute: executeGetPaymentsReport, isExecuting } = useAction(
    getPaymentsReport,
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
    executeGetPaymentsReport(filters);
  }, [filters, executeGetPaymentsReport]);
  const handleDateChange = (from: string, to: string) => {
    setFilters((prev) => ({ ...prev, from, to }));
  };
  const filteredData = (data: any[]) => {
    if (!searchTerm) return data;
    return data.filter(
      (item) =>
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  // Função para capitalizar nomes (primeira letra de cada palavra maiúscula)
  const capitalizeName = (name: string) => {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Função para normalizar email (sempre minúsculo)
  const normalizeEmail = (email: string) => {
    return email.toLowerCase();
  };
  const formatDate = (date: Date) => {
    return dayjs(date).format("DD/MM/YYYY");
  };
  // Preparar dados para o gráfico
  const prepareChartData = () => {
    if (!reportData) return [];

    const dailyData: {
      [key: string]: { paid: number; pending: number; overdue: number };
    } = {};

    // Inicializar dados para cada dia no período
    const startDate = dayjs(filters.from);
    const endDate = dayjs(filters.to);
    let currentDate = startDate;

    while (currentDate.isSame(endDate) || currentDate.isBefore(endDate)) {
      const dateKey = currentDate.format("YYYY-MM-DD");
      dailyData[dateKey] = { paid: 0, pending: 0, overdue: 0 };
      currentDate = currentDate.add(1, "day");
    } // Agrupar TODOS os dados por data (não filtrados)
    // Precisamos de todos os dados para o gráfico mostrar a distribuição completa
    const allPayments = reportData.allDetails
      ? [
          ...reportData.allDetails.paid,
          ...reportData.allDetails.pending,
          ...reportData.allDetails.overdue,
        ]
      : [
          ...reportData.details.paid,
          ...reportData.details.pending,
          ...reportData.details.overdue,
        ];

    allPayments.forEach((payment) => {
      const dateKey = dayjs(payment.appointmentDate).format("YYYY-MM-DD");
      if (dailyData[dateKey]) {
        if (payment.paymentStatus === "paid") {
          dailyData[dateKey].paid += payment.amount;
        } else if (payment.paymentStatus === "pending") {
          dailyData[dateKey].pending += payment.amount;
        } else if (payment.paymentStatus === "overdue") {
          dailyData[dateKey].overdue += payment.amount;
        }
      }
    });

    return Object.entries(dailyData).map(([date, values]) => ({
      date,
      ...values,
    }));
  };

  const PaymentStatusBadge = ({
    status,
  }: {
    status: "paid" | "pending" | "overdue";
  }) => {
    const variants = {
      paid: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Pago",
        className: "status-paid",
      },
      pending: {
        variant: "secondary" as const,
        icon: Clock,
        label: "Pendente",
        className: "status-pending",
      },
      overdue: {
        variant: "destructive" as const,
        icon: AlertCircle,
        label: "Em Atraso",
        className: "status-overdue",
      },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const SummaryCard = ({
    title,
    amount,
    count,
    icon: Icon,
    variant = "default",
  }: {
    title: string;
    amount: number;
    count: number;
    icon: any;
    variant?: "default" | "success" | "warning" | "destructive";
  }) => {
    const colorMap = {
      default: "text-blue-600",
      success: "text-green-600",
      warning: "text-yellow-600",
      destructive: "text-red-600",
    };

    const isOverdueWithAmount = variant === "destructive" && amount > 0;

    return (
      <Card
        className={`summary-card ${isOverdueWithAmount ? "border-red-200 bg-red-50" : ""}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle
            className={`text-sm font-medium ${isOverdueWithAmount ? "font-semibold text-red-600" : ""}`}
          >
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 ${colorMap[variant || "default"]}`} />
        </CardHeader>
        <CardContent>
          <div
            className={`amount text-2xl font-bold ${isOverdueWithAmount ? "text-red-600" : ""}`}
          >
            {formatCurrencyInCents(amount)}
          </div>
          <p className="text-muted-foreground text-xs">
            {count} {count === 1 ? "consulta" : "consultas"}
          </p>
        </CardContent>
      </Card>
    );
  };

  if (isExecuting) {
    return (
      <PrintLayout
        title="Relatório de Pagamentos"
        description="Carregando dados..."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
        title="Relatório de Pagamentos"
        description="Nenhum dado encontrado"
      >
        <div className="py-8 text-center">
          <p>Nenhum dado encontrado para o período selecionado.</p>
        </div>{" "}
      </PrintLayout>
    );
  }

  return (
    <PrintLayout
      title="Relatório de Pagamentos"
      description="Análise de pagamentos: clientes em atraso, aberto e pagos"
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
        {/* Gráfico de Distribuição - Fixo no topo */}
        <div className="reports-chart-section">
          <BarChartInteractive
            data={prepareChartData()}
            activeChart={activeChart}
            onActiveChartChange={setActiveChart}
          />
        </div>

        {/* Dados detalhados - Com scroll */}
        <div className="reports-tables-section">
          <Tabs defaultValue="paid" className="reports-tabs-container">
            <TabsList className="no-print flex-shrink-0">
              <TabsTrigger value="paid">
                Pagos ({reportData.summary.countPaid})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Em Aberto ({reportData.summary.countPending})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Em Atraso ({reportData.summary.countOverdue})
              </TabsTrigger>{" "}
            </TabsList>

            {/* Conteúdo das tabs com scroll */}
            <div className="reports-tabs-content">
              <TabsContent value="paid" className="mt-4 h-full">
                <div className="avoid-break">
                  {" "}
                  {/* Título e busca na mesma linha */}
                  <div className="report-section-header">
                    <h3 className="report-section-title">
                      Pagamentos Realizados
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
                  {filteredData(reportData.details.paid).length > 0 ? (
                    <div className="report-table-wrapper">
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Paciente</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Data Consulta</th>
                            <th>Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData(reportData.details.paid).map(
                            (payment) => (
                              <tr key={payment.id}>
                                <td>{capitalizeName(payment.patientName)}</td>
                                <td>{payment.patientPhone}</td>
                                <td>{normalizeEmail(payment.patientEmail)}</td>
                                <td>{formatDate(payment.appointmentDate)}</td>
                                <td className="font-medium">
                                  {formatCurrencyInCents(payment.amount)}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="report-empty-state">
                      Nenhum pagamento realizado encontrado.
                    </div>
                  )}
                </div>
              </TabsContent>{" "}
              <TabsContent value="pending" className="space-y-4">
                <div className="avoid-break">
                  {" "}
                  {/* Título e busca na mesma linha */}
                  <div className="report-section-header">
                    <h3 className="report-section-title">
                      Pagamentos em Aberto
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
                  {filteredData(reportData.details.pending).length > 0 ? (
                    <div className="report-table-wrapper">
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Paciente</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Data Consulta</th>
                            <th>Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData(reportData.details.pending).map(
                            (payment) => (
                              <tr key={payment.id}>
                                <td>{capitalizeName(payment.patientName)}</td>
                                <td>{payment.patientPhone}</td>
                                <td>{normalizeEmail(payment.patientEmail)}</td>
                                <td>{formatDate(payment.appointmentDate)}</td>
                                <td className="font-medium">
                                  {formatCurrencyInCents(payment.amount)}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="report-empty-state">
                      Nenhum pagamento em aberto encontrado.
                    </div>
                  )}
                </div>
              </TabsContent>{" "}
              <TabsContent value="overdue" className="h-full space-y-4">
                <div className="avoid-break h-full">
                  {" "}
                  {/* Título e busca na mesma linha */}
                  <div className="report-section-header">
                    <h3 className="report-section-title">
                      Pagamentos em Atraso
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
                  {filteredData(reportData.details.overdue).length > 0 ? (
                    <div className="report-table-wrapper">
                      <table className="report-table">
                        <thead>
                          <tr>
                            <th>Paciente</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Data Consulta</th>
                            <th>Valor</th>
                            <th>Dias em Atraso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData(reportData.details.overdue).map(
                            (payment) => (
                              <tr key={payment.id}>
                                <td>{capitalizeName(payment.patientName)}</td>
                                <td>{payment.patientPhone}</td>
                                <td>{normalizeEmail(payment.patientEmail)}</td>
                                <td>{formatDate(payment.appointmentDate)}</td>
                                <td className="font-medium">
                                  {formatCurrencyInCents(payment.amount)}
                                </td>
                                <td className="font-medium text-red-600">
                                  {payment.daysOverdue} dias
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="report-empty-state">
                      Nenhum pagamento em atraso encontrado.
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
