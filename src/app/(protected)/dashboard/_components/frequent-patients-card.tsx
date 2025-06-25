"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFrequencyLevel } from "@/hooks/use-frequency";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FrequentPatient {
  id: string;
  name: string;
  consultations: number;
}

interface FrequentPatientsCardProps {
  patients: FrequentPatient[];
}

export function FrequentPatientsCard({ patients }: FrequentPatientsCardProps) {
  // Mostrar apenas os 5 mais frequentes
  const topPatients = patients.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 text-yellow-500" />
          Pacientes Frequentes
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/patients">
            Ver todos
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {topPatients.length > 0 ? (
          topPatients.map((patient) => {
            const frequencyConfig = getFrequencyLevel(patient.consultations);
            const Icon = frequencyConfig.icon;

            return (
              <div
                key={patient.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-2 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-1 ${frequencyConfig.color}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{patient.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {patient.consultations} consulta
                      {patient.consultations !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${frequencyConfig.color}`}
                >
                  {frequencyConfig.level}
                </Badge>
              </div>
            );
          })
        ) : (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm">
              Nenhum paciente frequente ainda
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
