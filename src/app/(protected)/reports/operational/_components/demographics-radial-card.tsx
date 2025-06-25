"use client";

import { TrendingUp, Users } from "lucide-react";
import { RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PatientDemographic {
  sex: string;
  count: number;
  percentage: string;
  sexLabel: string;
}

interface DemographicsRadialCardProps {
  data: PatientDemographic[];
}

const chartConfig = {
  male: {
    label: "Masculino",
    color: "hsl(221, 83%, 53%)", // azul
  },
  female: {
    label: "Feminino",
    color: "hsl(340, 75%, 55%)", // rosa
  },
} satisfies ChartConfig;

export function DemographicsRadialCard({ data }: DemographicsRadialCardProps) {
  const totalPatients = data.reduce((acc, curr) => acc + curr.count, 0);

  // Transformar dados para o formato esperado pelo RadialBarChart
  const femaleCount = data.find((d) => d.sex === "female")?.count || 0;
  const maleCount = data.find((d) => d.sex === "male")?.count || 0;

  // Criar dados balanceados para o gráfico radial - cada gênero precisa de seu próprio valor percentual
  const chartData = [
    {
      gender: "combined",
      female: totalPatients > 0 ? (femaleCount / totalPatients) * 100 : 0,
      male: totalPatients > 0 ? (maleCount / totalPatients) * 100 : 0,
    },
  ];

  // Encontrar o sexo predominante
  const predominantSex = data.reduce(
    (max, current) => (current.count > max.count ? current : max),
    data[0] || { sex: "", count: 0, percentage: "0", sexLabel: "N/A" },
  );

  // Calcular a diferença percentual
  const difference = Math.abs(femaleCount - maleCount);
  const differencePercentage =
    totalPatients > 0 ? ((difference / totalPatients) * 100).toFixed(1) : "0";

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
        {data.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <Users className="text-muted-foreground mx-auto mb-2 h-6 w-6 opacity-50" />
              <p className="text-muted-foreground text-sm">
                Nenhum dado encontrado
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Gráfico Radial - MEIO (CENTRALIZADO E EXPANDINDO) */}
            <div className="flex flex-1 items-center justify-center">
              <ChartContainer
                config={chartConfig}
                className="aspect-square w-full max-w-[180px]"
              >
                <RadialBarChart
                  data={chartData}
                  startAngle={90}
                  endAngle={450}
                  innerRadius={50}
                  outerRadius={75}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <RadialBar
                    dataKey="male"
                    stackId="a"
                    cornerRadius={3}
                    fill="var(--color-male)"
                    className="stroke-transparent stroke-1"
                  />
                  <RadialBar
                    dataKey="female"
                    stackId="a"
                    cornerRadius={3}
                    fill="var(--color-female)"
                    className="stroke-transparent stroke-1"
                  />
                </RadialBarChart>
              </ChartContainer>
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
                        chartConfig[demographic.sex as keyof typeof chartConfig]
                          ?.color,
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
