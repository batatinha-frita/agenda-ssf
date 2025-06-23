"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";

dayjs.locale("pt-br");
import { Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Tooltip } from "recharts";

interface DailyAppointment {
  date: string;
  appointments: number;
}

interface WeeklyAppointmentsChartProps {
  weeklyAppointmentsData: DailyAppointment[];
  from: string;
  to: string;
}

const WeeklyAppointmentsChart = ({
  weeklyAppointmentsData,
  from,
  to,
}: WeeklyAppointmentsChartProps) => {
  const startDate = dayjs(from);
  const endDate = dayjs(to);
  const daysDiff = endDate.diff(startDate, "days");

  // Lógica inteligente baseada no período
  let title: string;
  let chartDays: string[];
  let formatLabel: (date: string) => string;
  if (daysDiff <= 7) {
    // Período pequeno (≤ 7 dias): mostrar por dia
    title =
      daysDiff === 6 ? "Agendamentos da Semana" : "Agendamentos do Período";

    chartDays = Array.from({ length: daysDiff + 1 }).map((_, i) =>
      startDate.add(i, "day").format("YYYY-MM-DD"),
    );
    formatLabel = (date: string) => dayjs(date).format("ddd");
  } else if (daysDiff <= 31) {
    // Período médio (8-31 dias): agrupar por semana
    title = "Agendamentos por Semana";

    // Gerar semanas do período
    const weeks: string[] = [];
    let currentDate = startDate.startOf("week");
    while (
      currentDate.isBefore(endDate) ||
      currentDate.isSame(endDate, "week")
    ) {
      weeks.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "week");
    }
    chartDays = weeks;
    formatLabel = (date: string) => {
      const weekStart = dayjs(date);
      const weekEnd = weekStart.add(6, "days");
      return `${weekStart.format("DD/MM")} - ${weekEnd.format("DD/MM")}`;
    };
  } else {
    // Período longo (>31 dias): agrupar por mês
    title = "Agendamentos por Mês";

    // Gerar meses do período
    const months: string[] = [];
    let currentDate = startDate.startOf("month");
    while (
      currentDate.isBefore(endDate) ||
      currentDate.isSame(endDate, "month")
    ) {
      months.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "month");
    }
    chartDays = months;
    formatLabel = (date: string) => dayjs(date).format("MMM/YY");
  }
  const chartData = chartDays.map((date) => {
    let appointmentsCount = 0;

    if (daysDiff <= 7) {
      // Para períodos pequenos: buscar dados do dia exato
      const dataForDay = weeklyAppointmentsData.find(
        (item: DailyAppointment) => item.date === date,
      );
      appointmentsCount = dataForDay?.appointments || 0;
    } else if (daysDiff <= 31) {
      // Para períodos médios: somar dados da semana
      const weekStart = dayjs(date);
      const weekEnd = weekStart.add(6, "days");
      appointmentsCount = weeklyAppointmentsData
        .filter((item) => {
          const itemDate = dayjs(item.date);
          return (
            itemDate.isAfter(weekStart.subtract(1, "day")) &&
            itemDate.isBefore(weekEnd.add(1, "day"))
          );
        })
        .reduce((sum, item) => sum + item.appointments, 0);
    } else {
      // Para períodos longos: somar dados do mês
      const monthStart = dayjs(date);
      const monthEnd = monthStart.endOf("month");
      appointmentsCount = weeklyAppointmentsData
        .filter((item) => {
          const itemDate = dayjs(item.date);
          return (
            itemDate.isAfter(monthStart.subtract(1, "day")) &&
            itemDate.isBefore(monthEnd.add(1, "day"))
          );
        })
        .reduce((sum, item) => sum + item.appointments, 0);
    }

    // Simular agendamentos pendentes como 30% dos confirmados
    const confirmedAppointments = appointmentsCount;
    const pendingAppointments = Math.floor(confirmedAppointments * 0.3);

    return {
      day: formatLabel(date),
      fullDate: date,
      confirmedAppointments: confirmedAppointments,
      pendingAppointments: pendingAppointments,
      total: confirmedAppointments + pendingAppointments,
    };
  });

  const chartConfig = {
    confirmedAppointments: {
      label: "Agendamentos Confirmados",
      color: "#3B82F6", // Azul
    },
    pendingAppointments: {
      label: "Agendamentos Pendentes",
      color: "#10B981", // Verde
    },
  } satisfies ChartConfig;
  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        {" "}
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <CardTitle className="text-sm">{title}</CardTitle>
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
            />{" "}
            <Tooltip
              formatter={(value: any, name: any) => {
                const label =
                  name === "confirmedAppointments"
                    ? "Confirmados"
                    : "Pendentes";
                return [value, label];
              }}
              labelFormatter={(label: any) => `Data: ${label}`}
            />
            <Bar
              dataKey="confirmedAppointments"
              stackId="a"
              fill="var(--color-confirmedAppointments)"
              radius={[0, 0, 2, 2]}
            />
            <Bar
              dataKey="pendingAppointments"
              stackId="a"
              fill="var(--color-pendingAppointments)"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyAppointmentsChart;
