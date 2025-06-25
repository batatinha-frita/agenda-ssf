"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";

interface PopularHour {
  hour: number;
  appointments: number;
  dayOfWeek: number;
  hourFormatted: string;
  dayName: string;
}

interface TopTimeSlotsCardProps {
  data: PopularHour[];
}

export function TopTimeSlotsCard({ data }: TopTimeSlotsCardProps) {
  // Agrupar dados por hora e pegar os top 4
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

  // Ordenar por número de consultas (decrescente) e pegar top 4
  const top4Hours = hourlyData
    .sort((a, b) => b.appointments - a.appointments)
    .slice(0, 4);

  // Se não há dados, mostrar estado vazio
  if (top4Hours.length === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Top 4 Horários
          </CardTitle>
          <CardDescription>Horários com maior demanda</CardDescription>
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

  const totalAppointments = top4Hours.reduce(
    (acc, curr) => acc + curr.appointments,
    0,
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          Top 4 Horários
        </CardTitle>
        <CardDescription>Horários com maior demanda</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-4">
        {/* Lista dos top 4 horários no meio */}
        <div className="flex-1 space-y-3">
          {top4Hours.map((hour, index) => {
            const percentage =
              totalAppointments > 0
                ? ((hour.appointments / totalAppointments) * 100).toFixed(1)
                : "0";

            return (
              <div
                key={hour.hour}
                className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{hour.hourFormatted}</div>
                    <div className="text-muted-foreground text-xs">
                      {hour.appointments} consultas
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {percentage}%
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Insights no rodapé */}
        <div className="mt-4 rounded-lg bg-orange-50 p-3">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {top4Hours[0]?.hourFormatted || "N/A"}
              </div>
              <div className="text-xs text-orange-700">Horário #1</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {top4Hours[0]?.appointments || 0}
              </div>
              <div className="text-xs text-orange-700">Consultas no pico</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {totalAppointments}
              </div>
              <div className="text-xs text-orange-700">Total top 4</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
