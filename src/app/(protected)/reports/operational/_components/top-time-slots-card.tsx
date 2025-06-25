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

interface TimeSlot {
  time: string;
  count: number;
  dayOfWeek?: string;
}

interface PopularHour {
  hour: number;
  appointments: number;
  hourFormatted: string;
  dayOfWeek: number;
  dayName: string;
}

interface TopTimeSlotsCardProps {
  data: PopularHour[];
}

export function TopTimeSlotsCard({ data }: TopTimeSlotsCardProps) {
  // Converter dados para o formato esperado e pegar os top 4 horários
  const convertedData: TimeSlot[] = data.map((item) => ({
    time: item.hourFormatted,
    count: item.appointments,
    dayOfWeek: item.dayName,
  }));

  const topSlots = convertedData.sort((a, b) => b.count - a.count).slice(0, 4);

  const totalAppointments = convertedData.reduce(
    (acc, curr) => acc + curr.count,
    0,
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Top 4 Horários por Dia
        </CardTitle>
        <CardDescription>
          Horários mais procurados pelos pacientes
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-3">
        {topSlots.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <div className="text-center">
              <Clock className="mx-auto mb-2 h-6 w-6 opacity-50" />
              <p className="text-sm">Nenhum horário encontrado</p>
            </div>
          </div>
        ) : (
          <>
            {/* Insight Compacto - TOPO */}
            <div className="mb-3 flex-shrink-0">
              <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-2">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900">
                    Horário de Pico
                  </span>
                </div>
                {topSlots.length > 0 && (
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-bold text-blue-700">
                      {topSlots[0].time}
                    </span>
                    <span className="text-xs text-blue-600">com</span>
                    <span className="text-sm font-bold text-blue-700">
                      {topSlots[0].count}
                    </span>
                    <span className="text-sm"></span>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de horários - MEIO (EXPANDINDO) */}
            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="h-full space-y-1.5 overflow-y-auto">
                {topSlots.map((slot, index) => {
                  const percentage =
                    totalAppointments > 0
                      ? ((slot.count / totalAppointments) * 100).toFixed(1)
                      : "0";

                  return (
                    <div
                      key={`${slot.time}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-2 transition-colors hover:bg-gray-100"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{slot.time}</p>
                          {slot.dayOfWeek && (
                            <p className="text-muted-foreground text-xs">
                              {slot.dayOfWeek}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <Badge variant="secondary" className="mb-1 text-xs">
                          {slot.count} consultas
                        </Badge>
                        <p className="text-muted-foreground text-xs">
                          {percentage}% do total
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
