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
import { BarChart3 } from "lucide-react";

interface DoctorOccupation {
  doctorId: string;
  doctorName: string;
  specialty: string;
  totalSlots: number;
  occupiedSlots: number;
  occupationRate: number;
}

interface OccupationRateCardProps {
  data: DoctorOccupation[];
}

const chartConfig = {
  occupationRate: {
    label: "Taxa de Ocupação (%)",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export function OccupationRateCard({ data }: OccupationRateCardProps) {
  // Preparar dados para o gráfico (máximo 10 médicos)
  const chartData = data.slice(0, 10).map((doctor) => ({
    doctorName:
      doctor.doctorName.length > 15
        ? doctor.doctorName.substring(0, 12) + "..."
        : doctor.doctorName,
    fullName: doctor.doctorName,
    specialty: doctor.specialty,
    occupationRate: Number(doctor.occupationRate) || 0,
    occupiedSlots: doctor.occupiedSlots,
    totalSlots: doctor.totalSlots,
  }));

  const averageOccupation =
    data.length > 0
      ? (
          data.reduce((acc, curr) => acc + Number(curr.occupationRate), 0) /
          data.length
        ).toFixed(1)
      : "0";

  const highestOccupation =
    data.length > 0
      ? Math.max(...data.map((d) => Number(d.occupationRate))).toFixed(1)
      : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Taxa de Ocupação por Médico
        </CardTitle>
        <CardDescription>
          Percentual de ocupação baseado na disponibilidade de horários
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <BarChart3 className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Nenhum dado de ocupação encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Métricas resumidas */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {averageOccupation}%
                </div>
                <div className="text-muted-foreground text-sm">
                  Ocupação Média
                </div>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {highestOccupation}%
                </div>
                <div className="text-muted-foreground text-sm">
                  Maior Ocupação
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="horizontal"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 60,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="doctorName"
                    width={80}
                    fontSize={12}
                  />
                  <Bar
                    dataKey="occupationRate"
                    fill={chartConfig.occupationRate.color}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Lista detalhada */}
            <div className="mt-4 space-y-2">
              <h4 className="text-muted-foreground text-sm font-medium">
                Detalhes por Médico
              </h4>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {data.map((doctor) => (
                  <div
                    key={doctor.doctorId}
                    className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{doctor.doctorName}</div>
                      <div className="text-muted-foreground text-xs">
                        {doctor.specialty}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        {Number(doctor.occupationRate).toFixed(1)}%
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {doctor.occupiedSlots}/{doctor.totalSlots} slots
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
