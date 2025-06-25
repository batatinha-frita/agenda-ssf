"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Users } from "lucide-react";

interface PatientDemographic {
  sex: string;
  count: number;
  percentage: string;
  sexLabel: string;
}

interface DemographicsCardProps {
  data: PatientDemographic[];
}

const chartConfig = {
  male: {
    label: "Masculino",
    color: "#3b82f6",
  },
  female: {
    label: "Feminino",
    color: "#ec4899",
  },
} satisfies ChartConfig;

export function DemographicsCard({ data }: DemographicsCardProps) {
  // Preparar dados para o gráfico
  const chartData = data.map((item) => ({
    name: item.sexLabel,
    value: item.count,
    percentage: item.percentage,
    color:
      chartConfig[item.sex as keyof typeof chartConfig]?.color || "#6b7280",
  }));

  const totalPatients = data.reduce((acc, curr) => acc + curr.count, 0);

  // Encontrar o sexo predominante
  const predominantSex = data.reduce(
    (max, current) => (current.count > max.count ? current : max),
    data[0] || {
      sex: "male" as const,
      count: 0,
      percentage: "0",
      sexLabel: "N/A",
    },
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-white p-2 shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            <span className="font-bold">{data.value}</span> pacientes (
            {data.percentage}%)
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
          <Users className="h-5 w-5 text-purple-600" />
          Demografia dos Pacientes
        </CardTitle>
        <CardDescription>
          Distribuição por sexo dos pacientes atendidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Nenhum dado demográfico encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Métrica principal */}
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {totalPatients}
              </div>
              <div className="text-muted-foreground text-sm">
                Total de Pacientes Únicos
              </div>
            </div>

            {/* Gráfico de Pizza com texto central */}
            <div className="relative">
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Texto central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {predominantSex.percentage}%
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {predominantSex.sexLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* Lista detalhada */}
            <div className="space-y-2">
              <h4 className="text-muted-foreground text-sm font-medium">
                Distribuição Detalhada
              </h4>
              <div className="space-y-1">
                {data
                  .sort((a, b) => b.count - a.count)
                  .map((demographic) => (
                    <div
                      key={demographic.sex}
                      className="flex items-center justify-between rounded bg-gray-50 p-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              chartConfig[
                                demographic.sex as keyof typeof chartConfig
                              ]?.color,
                          }}
                        />
                        <span className="font-medium">
                          {demographic.sexLabel}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {demographic.count} pacientes
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {demographic.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Insights */}
            <div className="mt-4 rounded-lg bg-indigo-50 p-3">
              <h4 className="mb-1 text-sm font-medium text-indigo-800">
                Insight
              </h4>
              <p className="text-xs text-indigo-700">
                {predominantSex.count > 0
                  ? parseFloat(predominantSex.percentage) >= 70
                    ? `Forte predominância do sexo ${predominantSex.sexLabel.toLowerCase()} (${predominantSex.percentage}%). Considere estratégias específicas para este público.`
                    : parseFloat(predominantSex.percentage) >= 60
                      ? `Leve predominância do sexo ${predominantSex.sexLabel.toLowerCase()}. Distribuição relativamente equilibrada.`
                      : "Distribuição equilibrada entre os sexos. Bom equilíbrio no atendimento."
                  : "Dados insuficientes para análise demográfica."}
              </p>
            </div>

            {/* Estatísticas adicionais */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.map((demographic) => (
                <div
                  key={demographic.sex}
                  className="rounded p-2 text-center"
                  style={{
                    backgroundColor: `${chartConfig[demographic.sex as keyof typeof chartConfig]?.color}15`,
                  }}
                >
                  <div
                    className="text-lg font-bold"
                    style={{
                      color:
                        chartConfig[demographic.sex as keyof typeof chartConfig]
                          ?.color,
                    }}
                  >
                    {demographic.count}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {demographic.sexLabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
