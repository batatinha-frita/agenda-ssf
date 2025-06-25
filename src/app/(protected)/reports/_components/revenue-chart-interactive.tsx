"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyInCents } from "@/helpers/currency";
import dayjs from "dayjs";

interface RevenueChartData {
  date: string;
  revenue: number;
  appointments: number;
}

interface RevenueChartInteractiveProps {
  data: RevenueChartData[];
  activeChart: "revenue" | "appointments";
  onActiveChartChange?: (chart: "revenue" | "appointments") => void;
}

export function RevenueChartInteractive({
  data,
  activeChart,
  onActiveChartChange,
}: RevenueChartInteractiveProps) {
  const [hoveredData, setHoveredData] = useState<RevenueChartData | null>(null);

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format("DD/MM");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-gray-900">
            {dayjs(label).format("DD/MM/YYYY")}
          </p>
          <p className="text-blue-600">
            Receita: {formatCurrencyInCents(data.revenue)}
          </p>
          <p className="text-green-600">Consultas: {data.appointments}</p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = () => {
    return activeChart === "revenue" ? "#3b82f6" : "#10b981";
  };

  const getDataKey = () => {
    return activeChart === "revenue" ? "revenue" : "appointments";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Receita por Período
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Análise temporal de receitas e consultas
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeChart === "revenue" ? "default" : "outline"}
              size="sm"
              onClick={() => onActiveChartChange?.("revenue")}
              className="text-sm"
            >
              Receita
            </Button>
            <Button
              variant={activeChart === "appointments" ? "default" : "outline"}
              size="sm"
              onClick={() => onActiveChartChange?.("appointments")}
              className="text-sm"
            >
              Consultas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: "#666" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={
                  activeChart === "revenue"
                    ? (value: any) => `R$ ${(value / 100).toFixed(0)}`
                    : (value: any) => value.toString()
                }
                tick={{ fontSize: 12, fill: "#666" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={getDataKey()}
                fill={getBarColor()}
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
                onMouseEnter={(data: any) => setHoveredData(data)}
                onMouseLeave={() => setHoveredData(null)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda */}
        <div className="mt-3 flex justify-center">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded ${activeChart === "revenue" ? "bg-blue-500" : "bg-green-500"}`}
              ></div>
              <span className="text-gray-600">
                {activeChart === "revenue"
                  ? "Receita (R$)"
                  : "Número de Consultas"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
