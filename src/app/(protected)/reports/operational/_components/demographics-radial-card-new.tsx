"use client";

import { Users } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PatientDemographic {
  sex: string;
  count: number;
  percentage: string;
  sexLabel: string;
}

interface DemographicsRadialCardProps {
  data: PatientDemographic[];
}

const COLORS = {
  male: "#3b82f6",
  female: "#ec4899",
};

export function DemographicsRadialCard({ data }: DemographicsRadialCardProps) {
  const totalPatients = data.reduce((acc, curr) => acc + curr.count, 0);

  // Se não há dados, mostrar estado vazio
  if (data.length === 0 || totalPatients === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Distribuição por Gênero
          </CardTitle>
          <CardDescription>
            Análise demográfica dos pacientes atendidos
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Users className="text-muted-foreground mx-auto mb-2 h-6 w-6 opacity-50" />
            <p className="text-muted-foreground text-sm">
              Nenhum dado encontrado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dados para o gráfico de pizza
  const chartData = data.map((demographic) => ({
    name: demographic.sexLabel,
    value: demographic.count,
    sex: demographic.sex,
    percentage: demographic.percentage,
  }));

  console.log("Demographics chart data:", chartData);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Distribuição por Gênero
        </CardTitle>
        <CardDescription>
          Análise demográfica dos pacientes atendidos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-between p-4">
        {/* Gráfico de Pizza - MEIO (CENTRALIZADO E EXPANDINDO) */}
        <div className="flex w-full flex-1 items-center justify-center">
          <div className="aspect-square w-full max-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} pacientes (${data.find((d) => d.sexLabel === name)?.percentage}%)`,
                    name,
                  ]}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.sex as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total de Pacientes - CENTRO */}
        <div className="flex-shrink-0 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {totalPatients}
          </div>
          <div className="text-muted-foreground text-xs">
            Total de Pacientes
          </div>
        </div>

        {/* Legenda - FINAL (GRUDADO EMBAIXO) */}
        <div className="grid w-full flex-shrink-0 grid-cols-2 gap-2 text-sm">
          {data.map((demographic) => (
            <div
              key={demographic.sex}
              className="flex items-center gap-2 rounded p-2"
            >
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    COLORS[demographic.sex as keyof typeof COLORS],
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium">
                  {demographic.sexLabel}
                </div>
                <div className="text-muted-foreground text-xs">
                  {demographic.count} ({demographic.percentage}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
