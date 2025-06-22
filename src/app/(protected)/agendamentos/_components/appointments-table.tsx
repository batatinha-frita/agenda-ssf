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
import { appointmentsTable } from "@/db/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";

interface AppointmentsTableProps {
  appointments: (typeof appointmentsTable.$inferSelect & {
    patient: {
      id: string;
      name: string;
    };
    doctor: {
      id: string;
      name: string;
      specialty: string;
    };
  })[];
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nenhum agendamento encontrado"
        description="Agende sua primeira consulta para começar a gerenciar os atendimentos da sua clínica."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Médico</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium">
                {appointment.patient.name}
              </TableCell>
              <TableCell>
                {format(new Date(appointment.date), "dd/MM/yyyy, HH:mm", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>{appointment.doctor.name}</TableCell>
              <TableCell>{appointment.doctor.specialty}</TableCell>
              <TableCell>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(appointment.appointmentPriceInCents / 100)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    appointment.paymentStatus === "paid"
                      ? "default"
                      : appointment.paymentStatus === "overdue"
                        ? "destructive"
                        : "secondary"
                  }
                  className={
                    appointment.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : appointment.paymentStatus === "overdue"
                        ? ""
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }
                >
                  {appointment.paymentStatus === "paid"
                    ? "Pago"
                    : appointment.paymentStatus === "overdue"
                      ? "Atrasado"
                      : "Em Aberto"}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/agendamentos/${appointment.id}`}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
