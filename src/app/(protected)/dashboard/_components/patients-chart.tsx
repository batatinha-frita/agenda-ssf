"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";

dayjs.locale("pt-br");
import { Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Tooltip } from "recharts";

interface DailyPatient {
  date: string;
  patients: number;
}

interface PatientsChartProps {
  patientsData: DailyPatient[];
}

const PatientsChart = ({ patientsData }: PatientsChartProps) => {
  // Gerar dados dos últimos 7 dias
  const chartDays = Array.from({ length: 7 }).map((_, i) =>
    dayjs()
      .subtract(6 - i, "days")
      .format("YYYY-MM-DD"),
  );

  const chartData = chartDays.map((date) => {
    const dataForDay = patientsData.find(
      (item: DailyPatient) => item.date === date,
    );
    const dayName = dayjs(date).format("ddd"); // Dom, Seg, Ter, etc.

    // Usar dados reais quando disponíveis, senão usar 0
    const newPatientsCount = dataForDay?.patients || 0;
    // Simular pacientes retornando como 60% dos novos pacientes
    const returningPatientsCount = Math.floor(newPatientsCount * 0.6);

    return {
      day: dayName,
      fullDate: date,
      newPatients: newPatientsCount,
      returningPatients: returningPatientsCount,
      total: newPatientsCount + returningPatientsCount,
    };
  });

  const chartConfig = {
    newPatients: {
      label: "Novos Pacientes",
      color: "#3B82F6", // Azul
    },
    returningPatients: {
      label: "Pacientes Retornando",
      color: "#10B981", // Verde
    },
  } satisfies ChartConfig;
  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm">Pacientes</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer
          config={chartConfig}
          className="max-h-[200px] min-h-[200px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={6}
              axisLine={false}
              fontSize={10}
            />{" "}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              fontSize={10}
            />
            <Tooltip
              formatter={(value: any, name: any) => {
                const label = name === "newPatients" ? "Novos" : "Retornando";
                return [value, label];
              }}
              labelFormatter={(label: any) => `Data: ${label}`}
            />
            <Bar
              dataKey="newPatients"
              stackId="a"
              fill="var(--color-newPatients)"
              radius={[0, 0, 2, 2]}
            />
            <Bar
              dataKey="returningPatients"
              stackId="a"
              fill="var(--color-returningPatients)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PatientsChart;
