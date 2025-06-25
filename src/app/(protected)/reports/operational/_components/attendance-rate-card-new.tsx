"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { UserCheck } from "lucide-react";

interface AppointmentStatus {
  status: string;
  count: number;
  percentage: string;
}

interface AttendanceRateCardProps {
  data: AppointmentStatus[];
}

const STATUS_COLORS = {
  completed: "#10b981", // verde
  cancelled: "#ef4444", // vermelho
  confirmed: "#3b82f6", // azul
  pending: "#f59e0b", // amarelo
};

const STATUS_LABELS = {
  completed: "Compareceu",
  cancelled: "Cancelado/No-show",
  confirmed: "Confirmado",
  pending: "Pendente",
};

export function AttendanceRateCard({ data }: AttendanceRateCardProps) {
  // Se não há dados, mostrar estado vazio
  if (data.length === 0) {
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
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <UserCheck className="text-muted-foreground mx-auto mb-2 h-6 w-6 opacity-50" />
            <p className="text-muted-foreground text-sm">
              Nenhum dado encontrado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  const chartData = data.map((item) => ({
    name:
      STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status,
    value: item.count,
    status: item.status,
    percentage: item.percentage,
  }));

  const totalAppointments = data.reduce((acc, curr) => acc + curr.count, 0);
  const completedData = data.find((d) => d.status === "completed");
  const cancelledData = data.find((d) => d.status === "cancelled");

  console.log("Attendance chart data:", chartData);

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
      <CardContent className="flex flex-1 flex-col items-center justify-between p-4">
        {/* Métricas no topo */}
        <div className="mb-4 grid w-full grid-cols-2 gap-3">
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {completedData?.percentage || "0"}%
            </div>
            <div className="text-xs text-green-700">Taxa de Comparecimento</div>
          </div>
          <div className="rounded-lg bg-red-50 p-3 text-center">
            <div className="text-2xl font-bold text-red-600">
              {cancelledData?.percentage || "0"}%
            </div>
            <div className="text-xs text-red-700">Taxa de No-show</div>
          </div>
        </div>

        {/* Gráfico no meio */}
        <div className="flex w-full flex-1 items-center justify-center">
          <div className="aspect-square w-full max-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value} consultas (${props.payload.percentage}%)`,
                    name,
                  ]}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        STATUS_COLORS[
                          entry.status as keyof typeof STATUS_COLORS
                        ]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total no centro */}
        <div className="mb-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {totalAppointments}
          </div>
          <div className="text-muted-foreground text-xs">
            Total de Consultas
          </div>
        </div>

        {/* Legenda no final */}
        <div className="w-full space-y-2">
          {chartData.map((item) => (
            <div
              key={item.status}
              className="flex items-center justify-between rounded bg-gray-50 p-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      STATUS_COLORS[item.status as keyof typeof STATUS_COLORS],
                  }}
                />
                <span className="text-xs font-medium">{item.name}</span>
              </div>
              <div className="text-muted-foreground text-xs">
                {item.value} ({item.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
