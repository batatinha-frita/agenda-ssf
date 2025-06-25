"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface AttendanceData {
  status: string;
  count: number;
  percentage: string;
}

interface AttendanceRateCardProps {
  data: AttendanceData[];
}

// Configuração de cores para os status
const COLORS = {
  confirmed: "hsl(221, 83%, 53%)", // azul
  completed: "hsl(142, 76%, 36%)", // verde
  cancelled: "hsl(0, 84%, 60%)", // vermelho
  pending: "hsl(45, 93%, 47%)", // amarelo
};

// Labels para os status
const statusLabels: Record<string, string> = {
  confirmed: "Confirmado",
  completed: "Compareceu",
  cancelled: "Cancelado/No-show",
  pending: "Pendente",
};

export function AttendanceRateCard({ data }: AttendanceRateCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Preparar dados para o gráfico
  const chartData = data.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item.count,
    percentage: item.percentage,
    color: COLORS[item.status as keyof typeof COLORS] || "#6b7280",
    status: item.status,
  }));

  const totalAppointments = data.reduce((acc, curr) => acc + curr.count, 0);

  // Calcular taxa de comparecimento real (completed / total)
  const completedAppointments =
    data.find((d) => d.status === "completed")?.count || 0;
  const attendanceRate =
    totalAppointments > 0
      ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
      : "0";

  // Calcular taxa de no-show (cancelled / total)
  const cancelledAppointments =
    data.find((d) => d.status === "cancelled")?.count || 0;
  const noShowRate =
    totalAppointments > 0
      ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1)
      : "0";

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-white p-3 shadow-lg">
          <p className="text-base font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="text-lg font-bold">{data.value}</span> consultas
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-bold">{data.percentage}%</span> do total
          </p>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-green-600" />
          Taxa de Comparecimento
        </CardTitle>
        <CardDescription>
          Análise de comparecimento vs não comparecimento
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-4">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <div className="text-center">
              <UserCheck className="mx-auto mb-2 h-6 w-6 opacity-50" />
              <p className="text-sm">Nenhum dado encontrado</p>
            </div>
          </div>
        ) : (
          <>
            {/* Métricas principais - TOPO */}
            <div className="grid flex-shrink-0 grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <div className="text-xl font-bold text-green-600">
                  {attendanceRate}%
                </div>
                <div className="text-muted-foreground text-xs">
                  Taxa de Comparecimento
                </div>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <div className="text-xl font-bold text-red-600">
                  {noShowRate}%
                </div>
                <div className="text-muted-foreground text-xs">
                  Taxa de No-show
                </div>
              </div>
            </div>

            {/* Gráfico de Pizza - MEIO (EXPANDINDO E CENTRALIZADO) */}
            <div className="flex flex-1 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Lista compacta - FINAL (GRUDADO EMBAIXO) */}
            <div className="flex-shrink-0 space-y-1">
              {data
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((status) => (
                  <div
                    key={status.status}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[status.status as keyof typeof COLORS] ||
                            "#6b7280",
                        }}
                      />
                      <span className="truncate">
                        {statusLabels[status.status] || status.status}
                      </span>
                    </div>
                    <span className="font-medium">
                      {status.count} ({status.percentage}%)
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
