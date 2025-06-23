"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrencyInCents } from "@/helpers/currency";
import dayjs from "dayjs";

interface PaymentChartData {
  date: string;
  paid: number;
  pending: number;
  overdue: number;
}

interface BarChartInteractiveProps {
  data: PaymentChartData[];
  activeChart?: "all" | "paid" | "pending" | "overdue";
  onActiveChartChange?: (chart: "all" | "paid" | "pending" | "overdue") => void;
}

const chartConfig = {
  paid: {
    label: "Pagos",
    color: "#22c55e", // green-500
  },
  pending: {
    label: "Em Aberto",
    color: "#3b82f6", // blue-500
  },
  overdue: {
    label: "Em Atraso",
    color: "#ef4444", // red-500
  },
} satisfies ChartConfig;

export function BarChartInteractive({
  data,
  activeChart = "all",
  onActiveChartChange,
}: BarChartInteractiveProps) {
  const total = React.useMemo(
    () => ({
      paid: data.reduce((acc, curr) => acc + curr.paid, 0),
      pending: data.reduce((acc, curr) => acc + curr.pending, 0),
      overdue: data.reduce((acc, curr) => acc + curr.overdue, 0),
    }),
    [data],
  );

  // Adicionar botão "Todos"
  const chartButtons = [
    {
      key: "all" as const,
      label: "Todos",
      total: total.paid + total.pending + total.overdue,
    },
    { key: "paid" as const, label: "Pagos", total: total.paid },
    { key: "pending" as const, label: "Em Aberto", total: total.pending },
    { key: "overdue" as const, label: "Em Atraso", total: total.overdue },
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 pt-4 sm:!py-6">
          <CardTitle>Distribuição dos Pagamentos</CardTitle>
          <CardDescription>
            Visualização dos valores por status de pagamento
          </CardDescription>
        </div>
        <div className="flex">
          {chartButtons.map(({ key, label, total: buttonTotal }) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => onActiveChartChange?.(key)}
            >
              <span className="text-muted-foreground text-xs">{label}</span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {formatCurrencyInCents(buttonTotal)}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return dayjs(value).format("DD/MM");
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  nameKey="values"
                  labelFormatter={(value) => {
                    return dayjs(value).format("DD/MM/YYYY");
                  }}
                  formatter={(value: any, name: any) => {
                    if (activeChart === "all") {
                      // Para "todos", mostrar o nome da série
                      const seriesConfig =
                        chartConfig[name as keyof typeof chartConfig];
                      return [
                        formatCurrencyInCents(value),
                        seriesConfig?.label || name,
                      ];
                    } else {
                      // Para individual, mostrar o tipo selecionado
                      const config =
                        chartConfig[activeChart as keyof typeof chartConfig];
                      return [
                        formatCurrencyInCents(value),
                        config?.label || activeChart,
                      ];
                    }
                  }}
                />
              }
            />
            {activeChart === "all" ? (
              // Mostrar todas as barras quando "Todos" estiver selecionado
              <>
                <Bar
                  dataKey="paid"
                  fill={chartConfig.paid.color}
                  radius={[4, 4, 0, 0]}
                  name="paid"
                />
                <Bar
                  dataKey="pending"
                  fill={chartConfig.pending.color}
                  radius={[4, 4, 0, 0]}
                  name="pending"
                />
                <Bar
                  dataKey="overdue"
                  fill={chartConfig.overdue.color}
                  radius={[4, 4, 0, 0]}
                  name="overdue"
                />
              </>
            ) : (
              // Mostrar apenas a barra selecionada
              <Bar
                dataKey={activeChart}
                fill={
                  chartConfig[activeChart as keyof typeof chartConfig]?.color
                }
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
