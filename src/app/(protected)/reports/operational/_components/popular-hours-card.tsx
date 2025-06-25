"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Clock } from "lucide-react";

interface PopularHour {
  hour: number;
  appointments: number;
  dayOfWeek: number;
  hourFormatted: string;
  dayName: string;
}

interface PopularHoursCardProps {
  data: PopularHour[];
}

const chartConfig = {
  appointments: {
    label: "Consultas",
    color: "#10b981",
  },
} satisfies ChartConfig;

export function PopularHoursCard({ data }: PopularHoursCardProps) {
  // Agrupar dados por hora (somar todos os dias da semana)
  const hourlyData = data.reduce(
    (acc, curr) => {
      const existing = acc.find((item) => item.hour === curr.hour);
      if (existing) {
        existing.appointments += curr.appointments;
      } else {
        acc.push({
          hour: curr.hour,
          hourFormatted: curr.hourFormatted,
          appointments: curr.appointments,
        });
      }
      return acc;
    },
    [] as { hour: number; hourFormatted: string; appointments: number }[],
  );

  // Ordenar por número de consultas (top 8)
  const chartData = hourlyData
    .sort((a, b) => b.appointments - a.appointments)
    .slice(0, 8);

  const totalAppointments = data.reduce(
    (acc, curr) => acc + curr.appointments,
    0,
  );
  const peakHour = chartData.length > 0 ? chartData[0] : null;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-600" />
          Horários Mais Populares
        </CardTitle>
        <CardDescription>
          Distribuição de consultas por horário do dia
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-4">
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <div className="text-center">
              <Clock className="mx-auto mb-2 h-6 w-6 opacity-50" />
              <p className="text-sm">Nenhum dado encontrado</p>
            </div>
          </div>
        ) : (
          <>
            {/* Métricas resumidas - TOPO */}
            <div className="grid flex-shrink-0 grid-cols-2 gap-4">
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <div className="text-xl font-bold text-green-600">
                  {peakHour?.hourFormatted || "N/A"}
                </div>
                <div className="text-muted-foreground text-xs">
                  Horário de Pico
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <div className="text-xl font-bold text-blue-600">
                  {totalAppointments}
                </div>
                <div className="text-muted-foreground text-xs">
                  Total de Consultas
                </div>
              </div>
            </div>

            {/* Gráfico - MEIO (EXPANDINDO) */}
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 15,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="hourFormatted"
                      fontSize={11}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis fontSize={11} tick={{ fontSize: 11 }} width={35} />
                    <Bar
                      dataKey="appointments"
                      fill={chartConfig.appointments.color}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Espaço reservado para o final (mesmo que vazio) */}
            <div className="flex-shrink-0">
              {/* Rodapé vazio para manter estrutura */}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
