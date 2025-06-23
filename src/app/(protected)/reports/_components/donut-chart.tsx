"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

interface DonutChartProps {
  data: {
    label: string;
    value: number;
    count: number;
    color: string;
  }[];
  title: string;
  description?: string;
}

export function DonutChart({ data, title, description }: DonutChartProps) {
  // Calcular total para percentuais
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Se não há dados, mostrar gráfico vazio
  if (total === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-lg font-medium">Nenhum dado disponível</div>
              <div className="text-sm">Para o período selecionado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Configurações do SVG
  const size = 200;
  const strokeWidth = 40;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calcular segmentos
  let currentAngle = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      ...item,
      percentage,
      angle,
      startAngle: currentAngle,
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-8 lg:flex-row">
          {/* Gráfico Donut SVG */}
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} className="-rotate-90 transform">
              {/* Círculo de fundo */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f3f4f6"
                strokeWidth={strokeWidth}
              />

              {/* Segmentos do donut */}
              {segments.map((segment, index) => {
                if (segment.percentage === 0) return null;

                const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -(
                  (segment.startAngle / 360) *
                  circumference
                );

                return (
                  <circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Centro com valor total */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrencyInCents(total)}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="h-4 w-4 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-gray-900">
                      {segment.label}
                    </span>
                    <span className="flex-shrink-0 text-sm text-gray-500">
                      {segment.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
                    <span className="truncate">
                      {formatCurrencyInCents(segment.value)}
                    </span>
                    <span className="flex-shrink-0">
                      {segment.count}{" "}
                      {segment.count === 1 ? "consulta" : "consultas"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
