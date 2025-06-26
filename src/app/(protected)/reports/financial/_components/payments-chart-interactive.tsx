"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import dayjs from "dayjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartDataPoint {
  date: string;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalGenerated: number;
}

interface PaymentsChartInteractiveProps {
  data: ChartDataPoint[];
  activeChart: "totalGenerated" | "paid" | "pending" | "overdue";
  onActiveChartChange?: (
    chart: "totalGenerated" | "paid" | "pending" | "overdue",
  ) => void;
}

const chartConfig = {
  totalGenerated: {
    label: "Total Gerado",
    color: "hsl(217, 91%, 40%)", // Azul 800
  },
  paid: {
    label: "Pagos",
    color: "hsl(142, 76%, 30%)", // Verde 800
  },
  pending: {
    label: "Pendente",
    color: "hsl(48, 96%, 40%)", // Amarelo 800
  },
  overdue: {
    label: "Em Atraso",
    color: "hsl(0, 84%, 40%)", // Vermelho 800
  },
} satisfies ChartConfig;

export function PaymentsChartInteractive({
  data,
  activeChart,
  onActiveChartChange,
}: PaymentsChartInteractiveProps) {
  const total = React.useMemo(() => {
    return {
      totalGenerated: data.reduce((acc, curr) => acc + curr.totalGenerated, 0),
      paid: data.reduce((acc, curr) => acc + curr.totalPaid, 0),
      pending: data.reduce((acc, curr) => acc + curr.totalPending, 0),
      overdue: data.reduce((acc, curr) => acc + curr.totalOverdue, 0),
    };
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const getDataKey = () => {
    switch (activeChart) {
      case "paid":
        return "totalPaid";
      case "pending":
        return "totalPending";
      case "overdue":
        return "totalOverdue";
      default:
        return "totalGenerated";
    }
  };

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Pagamentos por Período</CardTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            Análise temporal de pagamentos por status
          </p>
        </div>
        <div className="flex">
          {(["totalGenerated", "paid", "pending", "overdue"] as const).map(
            (key) => {
              const chart = key as keyof typeof chartConfig;
              return (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  onClick={() => onActiveChartChange?.(chart)}
                >
                  <span className="text-muted-foreground text-xs">
                    {chartConfig[chart].label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-3xl">
                    {formatCurrency(total[key as keyof typeof total])}
                  </span>
                </button>
              );
            },
          )}
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
                const date = dayjs(value);
                return date.format("DD/MM");
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  nameKey="payments"
                  labelFormatter={(value) => {
                    return dayjs(value).format("DD/MM/YYYY");
                  }}
                  formatter={(value) => [
                    formatCurrency(value as number),
                    chartConfig[activeChart].label,
                  ]}
                />
              }
            />
            <Bar
              dataKey={getDataKey()}
              fill={chartConfig[activeChart].color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
