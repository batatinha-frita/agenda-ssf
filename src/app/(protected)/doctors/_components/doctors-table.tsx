"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { doctorsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";
import { Stethoscope } from "lucide-react";

import { DoctorStatusSelector } from "./doctor-status-selector";
import { DoctorActionButton } from "./doctor-action-button";

interface DoctorsTableProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
}

// Mapeamento de especialidades para ícones
const SPECIALTY_ICONS: Record<string, string> = {
  Cardiologia: "🩺",
  Pediatria: "💊",
  Neurologia: "🧠",
  Ortopedia: "🦴",
  Oftalmologia: "👁️",
  Odontologia: "🦷",
  Dermatologia: "👩‍⚕️",
  Pneumologia: "🫁",
  Ginecologia: "🌸",
  Urologia: "💧",
  Psiquiatria: "🧘‍♂️",
  Oncologia: "🎗️",
};

function getSpecialtyIcon(specialty: string): string {
  return SPECIALTY_ICONS[specialty] || "🩺";
}

// Função para mapear dias da semana
function getWeekDayName(day: number): string {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return days[day] || day.toString();
}

export function DoctorsTable({ doctors }: DoctorsTableProps) {
  if (doctors.length === 0) {
    return (
      <EmptyState
        icon={Stethoscope}
        title="Nenhum médico encontrado"
        description="Não há médicos que correspondam aos critérios de busca."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => {
            const specialtyIcon = getSpecialtyIcon(doctor.specialty);
            const fromDay = getWeekDayName(doctor.availableFromWeekDay);
            const toDay = getWeekDayName(doctor.availableToWeekDay);

            return (
              <TableRow key={doctor.id}>
                <TableCell className="font-medium">{doctor.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{specialtyIcon}</span>
                    <Badge variant="outline">{doctor.specialty}</Badge>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrencyInCents(doctor.appointmentPriceInCents)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  <div>
                    <div>
                      {doctor.availableFromTime} - {doctor.availableToTime}
                    </div>
                    <div className="text-xs opacity-70">
                      {fromDay} - {toDay}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DoctorStatusSelector
                    doctorId={doctor.id}
                    currentStatus={doctor.status}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DoctorActionButton doctor={doctor} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
