"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";

interface PopularHour {
  hour: number;
  appointments: number;
  dayOfWeek: number;
  hourFormatted: string;
  dayName: string;
}

interface PopularHoursCardProps {
  data: PopularHour[];
  attendanceRate?: string;
  noShowRate?: string;
}

export function PopularHoursCard({
  data,
  attendanceRate = "0.0",
  noShowRate = "0.0",
}: PopularHoursCardProps) {
  // Agrupar dados por hora (somar todos os dias da semana)
  const hourlyData = data.reduce(
    (acc, curr) => {
      const existing = acc.find((item) => item.hour === curr.hour);
      if (existing) {
        existing.appointments += curr.appointments;
      } else {
        acc.push({
          hour: curr.hour,
          appointments: curr.appointments,
          hourFormatted: curr.hourFormatted,
        });
      }
      return acc;
    },
    [] as { hour: number; appointments: number; hourFormatted: string }[],
  );

  // Ordenar por hora
  const sortedData = hourlyData.sort((a, b) => a.hour - b.hour);

  // Se não há dados, mostrar estado vazio
  if (sortedData.length === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Horários Mais Populares
          </CardTitle>
          <CardDescription>
            Distribuição das consultas por horário do dia
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Clock className="text-muted-foreground mx-auto mb-2 h-6 w-6 opacity-50" />
            <p className="text-muted-foreground text-sm">
              Nenhum dado encontrado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Horários Mais Populares
        </CardTitle>
        <CardDescription>
          Distribuição das consultas por horário do dia
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-4">
        {/* Métricas no topo */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-2xl font-bold">{attendanceRate}%</span>
            </div>
            <p className="text-sm text-green-700">Taxa de Comparecimento</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-2xl font-bold">{noShowRate}%</span>
            </div>
            <p className="text-sm text-red-700">Taxa de No-show</p>
          </div>
        </div>

        {/* Gráfico no meio */}
        <div className="w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="hourFormatted"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value} consultas`,
                  "Consultas",
                ]}
                labelFormatter={(label) => `Horário: ${label}`}
              />
              <Bar
                dataKey="appointments"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rodapé com insights */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="text-center">
            <div className="text-lg font-semibold">
              {Math.max(...sortedData.map((d) => d.appointments))}
            </div>
            <div className="text-muted-foreground text-xs">Pico máximo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {
                sortedData.find(
                  (d) =>
                    d.appointments ===
                    Math.max(...sortedData.map((s) => s.appointments)),
                )?.hourFormatted
              }
            </div>
            <div className="text-muted-foreground text-xs">
              Horário mais popular
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {sortedData.reduce((acc, curr) => acc + curr.appointments, 0)}
            </div>
            <div className="text-muted-foreground text-xs">Total consultas</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
