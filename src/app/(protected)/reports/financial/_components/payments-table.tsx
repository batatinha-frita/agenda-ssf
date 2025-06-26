"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Calendar, Clock, Phone, Mail } from "lucide-react";
import { formatCurrencyInCents } from "@/helpers/currency";
import dayjs from "dayjs";
import type { PaymentDetail } from "@/actions/get-payments-report";

interface PaymentsTableProps {
  data: {
    paid: PaymentDetail[];
    pending: PaymentDetail[];
    overdue: PaymentDetail[];
  };
  isLoading?: boolean;
}

type PaymentStatus = "all" | "paid" | "pending" | "overdue";

export function PaymentsTable({ data, isLoading }: PaymentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<PaymentStatus>("all");

  // Combinar todos os dados em uma única lista
  const allPayments = useMemo(() => {
    if (!data) return [];
    return [...data.paid, ...data.pending, ...data.overdue];
  }, [data]);

  // Filtrar dados com base na pesquisa e na aba ativa
  const filteredPayments = useMemo(() => {
    let payments = allPayments;

    // Filtrar por aba
    if (activeTab !== "all") {
      payments = data[activeTab] || [];
    }

    // Filtrar por pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      payments = payments.filter(
        (payment) =>
          payment.patientName.toLowerCase().includes(term) ||
          payment.doctorName.toLowerCase().includes(term) ||
          payment.doctorSpecialty.toLowerCase().includes(term) ||
          payment.patientPhone.includes(term) ||
          payment.patientEmail.toLowerCase().includes(term),
      );
    }

    return payments;
  }, [allPayments, data, activeTab, searchTerm]);

  // Contar itens por status
  const statusCounts = useMemo(
    () => ({
      all: allPayments.length,
      paid: data.paid?.length || 0,
      pending: data.pending?.length || 0,
      overdue: data.overdue?.length || 0,
    }),
    [allPayments, data],
  );

  const getStatusBadge = (status: PaymentDetail["paymentStatus"]) => {
    const statusConfig = {
      paid: {
        label: "Pago",
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      pending: {
        label: "Em Aberto",
        variant: "secondary" as const,
        className: "bg-amber-100 text-amber-800",
      },
      overdue: {
        label: "Atrasado",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleExport = () => {
    // Preparar dados para exportação
    const exportData = filteredPayments.map((payment) => ({
      Paciente: payment.patientName,
      Telefone: payment.patientPhone,
      Email: payment.patientEmail,
      Procedimento: payment.doctorSpecialty,
      Médico: payment.doctorName,
      "Data da Consulta": dayjs(payment.appointmentDate).format(
        "DD/MM/YYYY HH:mm",
      ),
      Valor: formatCurrencyInCents(payment.amount),
      Status:
        payment.paymentStatus === "paid"
          ? "Pago"
          : payment.paymentStatus === "pending"
            ? "Em Aberto"
            : "Atrasado",
      "Dias de Atraso": payment.daysOverdue || "",
    }));

    // Converter para CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        headers.map((header) => `"${(row as any)[header] || ""}"`).join(","),
      ),
    ].join("\n");

    // Download do arquivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `relatorio-pagamentos-${dayjs().format("YYYY-MM-DD")}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detalhes dos Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-80 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-full animate-pulse rounded bg-gray-200"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Detalhes dos Pagamentos</CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Barra de pesquisa */}
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Pesquisar por paciente, procedimento, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Abas de status e conteúdo */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as PaymentStatus)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1"></div> {/* Espaçador */}
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  Todos
                  <Badge variant="secondary" className="text-xs">
                    {statusCounts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="paid" className="flex items-center gap-2">
                  Pagos
                  <Badge variant="secondary" className="text-xs">
                    {statusCounts.paid}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-2"
                >
                  Em Aberto
                  <Badge variant="secondary" className="text-xs">
                    {statusCounts.pending}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="overdue"
                  className="flex items-center gap-2"
                >
                  Atrasados
                  <Badge variant="secondary" className="text-xs">
                    {statusCounts.overdue}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-4">
              {filteredPayments.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  {searchTerm
                    ? "Nenhum resultado encontrado para a pesquisa."
                    : "Nenhum pagamento encontrado."}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Procedimento</TableHead>
                        <TableHead>Data da Consulta</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {payment.patientName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="mr-1 h-3 w-3" />
                                {payment.patientPhone}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="mr-1 h-3 w-3" />
                                {payment.patientEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {payment.doctorSpecialty}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-1 h-3 w-3" />
                              {dayjs(payment.appointmentDate).format(
                                "DD/MM/YYYY",
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="mr-1 h-3 w-3" />
                              {dayjs(payment.appointmentDate).format("HH:mm")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrencyInCents(payment.amount)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.paymentStatus)}
                            {payment.daysOverdue && (
                              <div className="mt-1 text-xs text-red-600">
                                {payment.daysOverdue} dias de atraso
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
