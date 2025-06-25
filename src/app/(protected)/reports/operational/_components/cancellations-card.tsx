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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { XCircle } from "lucide-react";
import dayjs from "dayjs";

interface CancellationByDate {
  date: string;
  cancelled: number;
}

interface CancellationsCardProps {
  data: CancellationByDate[];
}

const chartConfig = {
  cancelled: {
    label: "Cancelamentos",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function CancellationsCard({ data }: CancellationsCardProps) {
  // Preparar dados para o gráfico
  const chartData = data.map((item) => ({
    ...item,
    dateFormatted: dayjs(item.date).format("DD/MM"),
    fullDate: dayjs(item.date).format("DD/MM/YYYY"),
  }));

  const totalCancellations = data.reduce(
    (acc, curr) => acc + curr.cancelled,
    0,
  );
  const averageCancellations =
    data.length > 0 ? (totalCancellations / data.length).toFixed(1) : "0";

  // Encontrar o dia com mais cancelamentos
  const peakCancellationDay = data.reduce(
    (max, current) => (current.cancelled > max.cancelled ? current : max),
    data[0] || { date: "", cancelled: 0 },
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-white p-2 shadow-md">
          <p className="font-medium">{data.fullDate}</p>
          <p className="text-sm">
            <span className="font-bold text-red-600">{data.cancelled}</span>{" "}
            cancelamentos
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-600" />
          Análise de Cancelamentos
        </CardTitle>
        <CardDescription>Tendência de cancelamentos por data</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <XCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Nenhum cancelamento encontrado no período</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Métricas resumidas */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {totalCancellations}
                </div>
                <div className="text-muted-foreground text-sm">
                  Total de Cancelamentos
                </div>
              </div>
              <div className="rounded-lg bg-orange-50 p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {averageCancellations}
                </div>
                <div className="text-muted-foreground text-sm">
                  Média por Dia
                </div>
              </div>
            </div>

            {/* Gráfico de Linha */}
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateFormatted" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="cancelled"
                    stroke={chartConfig.cancelled.color}
                    strokeWidth={2}
                    dot={{
                      fill: chartConfig.cancelled.color,
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Informações detalhadas */}
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-medium">
                Resumo do Período
              </h4>

              {peakCancellationDay.cancelled > 0 && (
                <div className="rounded bg-red-50 p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-800">
                      Dia com mais cancelamentos:
                    </span>
                    <span className="font-bold text-red-600">
                      {dayjs(peakCancellationDay.date).format("DD/MM/YYYY")}(
                      {peakCancellationDay.cancelled} cancelamentos)
                    </span>
                  </div>
                </div>
              )}

              {/* Lista dos dias com cancelamentos */}
              <div className="max-h-32 space-y-1 overflow-y-auto">
                {data
                  .filter((day) => day.cancelled > 0)
                  .sort((a, b) => b.cancelled - a.cancelled)
                  .slice(0, 5)
                  .map((day) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm"
                    >
                      <div className="font-medium">
                        {dayjs(day.date).format("DD/MM/YYYY")}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          {day.cancelled} cancelamentos
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Insights */}
            <div className="mt-4 rounded-lg bg-orange-50 p-3">
              <h4 className="mb-1 text-sm font-medium text-orange-800">
                Insight
              </h4>
              <p className="text-xs text-orange-700">
                {parseFloat(averageCancellations) >= 5
                  ? "Alta taxa de cancelamentos. Considere implementar políticas de confirmação mais rigorosas."
                  : parseFloat(averageCancellations) >= 2
                    ? "Taxa moderada de cancelamentos. Monitore os motivos para identificar padrões."
                    : totalCancellations === 0
                      ? "Excelente! Nenhum cancelamento registrado no período."
                      : "Baixa taxa de cancelamentos. Continue com as práticas atuais."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
