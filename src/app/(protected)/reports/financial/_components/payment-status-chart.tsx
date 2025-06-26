"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { formatCurrencyInCents } from "@/helpers/currency";
import type { PaymentSummary } from "@/actions/get-payments-report";

interface PaymentStatusChartProps {
  data: PaymentSummary;
  isLoading?: boolean;
}

export function PaymentStatusChart({
  data,
  isLoading,
}: PaymentStatusChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];

    return [
      {
        status: "Pago",
        value: data.totalPaid / 100, // Converter de centavos para reais
        count: data.countPaid,
        color: "#22c55e", // green-500
      },
      {
        status: "Em Aberto",
        value: data.totalPending / 100,
        count: data.countPending,
        color: "#f59e0b", // amber-500
      },
      {
        status: "Atrasado",
        value: data.totalOverdue / 100,
        count: data.countOverdue,
        color: "#ef4444", // red-500
      },
    ];
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Valor:</span>{" "}
            {formatCurrencyInCents(data.value * 100)}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Consultas:</span> {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status de Pagamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis
                dataKey="status"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrencyInCents(value * 100)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda personalizada */}
        <div className="mt-4 flex justify-center space-x-6">
          {chartData.map((item) => (
            <div key={item.status} className="flex items-center space-x-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">
                {item.status} ({item.count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
