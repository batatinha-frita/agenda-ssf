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
import { appointmentsTable, patientsTable, doctorsTable } from "@/db/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Calendar, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { DeleteAppointmentButton } from "./delete-appointment-button";
import { UpsertAppointmentAction } from "./upsert-appointment-action";

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
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

export function AppointmentsTable({
  appointments,
  patients,
  doctors,
}: AppointmentsTableProps) {
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
          {" "}
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Médico</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
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
                </Badge>{" "}
              </TableCell>{" "}
              <TableCell>
                <Badge
                  variant={
                    appointment.appointmentStatus === "confirmed"
                      ? "default"
                      : appointment.appointmentStatus === "cancelled"
                        ? "destructive"
                        : appointment.appointmentStatus === "completed"
                          ? "default"
                          : "secondary"
                  }
                  className={
                    appointment.appointmentStatus === "confirmed"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : appointment.appointmentStatus === "cancelled"
                        ? ""
                        : appointment.appointmentStatus === "completed"
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                >
                  {appointment.appointmentStatus === "confirmed"
                    ? "Confirmado"
                    : appointment.appointmentStatus === "cancelled"
                      ? "Cancelado"
                      : appointment.appointmentStatus === "completed"
                        ? "Realizado"
                        : "Pendente"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link href={`/appointments/${appointment.id}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>{" "}
                  <UpsertAppointmentAction
                    appointment={{
                      ...appointment,
                      patient: patients.find(
                        (p) => p.id === appointment.patient.id,
                      )!,
                      doctor: doctors.find(
                        (d) => d.id === appointment.doctorId,
                      )!,
                    }}
                    patients={patients}
                    doctors={doctors}
                  >
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </UpsertAppointmentAction>
                  <DeleteAppointmentButton
                    appointmentId={appointment.id}
                    patientName={appointment.patient.name}
                  >
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DeleteAppointmentButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
