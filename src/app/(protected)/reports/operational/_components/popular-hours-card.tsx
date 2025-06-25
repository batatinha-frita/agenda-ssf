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
  attendanceRate?: string;
  noShowRate?: string;
}

const mockData = [
  { hour: 8, hourFormatted: "08:00", appointments: 12 },
  { hour: 9, hourFormatted: "09:00", appointments: 18 },
  { hour: 10, hourFormatted: "10:00", appointments: 15 },
  { hour: 11, hourFormatted: "11:00", appointments: 9 },
  { hour: 14, hourFormatted: "14:00", appointments: 21 },
  { hour: 15, hourFormatted: "15:00", appointments: 16 },
  { hour: 16, hourFormatted: "16:00", appointments: 13 },
  { hour: 17, hourFormatted: "17:00", appointments: 8 },
];

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
            <div className="flex max-h-[280px] min-h-[200px] flex-1 items-center justify-center overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="hourFormatted"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    height={25}
                  />
                  <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={25}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Taxas de Comparecimento - FINAL (GRUDADO EMBAIXO) */}
            <div className="grid flex-shrink-0 grid-cols-2 gap-3 border-t pt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {attendanceRate}%
                </div>
                <div className="text-muted-foreground text-xs">
                  Taxa de Comparecimento
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {noShowRate}%
                </div>
                <div className="text-muted-foreground text-xs">
                  Taxa de No-show
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
