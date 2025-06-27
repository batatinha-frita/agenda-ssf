"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, Edit, Ban, RotateCcw } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { appointmentsTable, patientsTable, doctorsTable } from "@/db/schema";
import { UpsertAppointmentAction } from "../../appointments/_components/upsert-appointment-action";
import { CancelAppointmentButton } from "../../appointments/_components/cancel-appointment-button";
import { ReactivateAppointmentButton } from "../../appointments/_components/reactivate-appointment-button";

export type TodayAppointment = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
};

interface AppointmentsColumnsProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

export const createAppointmentsColumns = ({
  patients,
  doctors,
}: AppointmentsColumnsProps): ColumnDef<TodayAppointment>[] => [
  {
    id: "patientName",
    accessorFn: (row) => row.patient.name,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Paciente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.patient.name}</div>;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Data/Hora
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {format(new Date(row.getValue("date")), "dd/MM/yyyy, HH:mm", {
            locale: ptBR,
          })}
        </div>
      );
    },
  },
  {
    id: "doctorName",
    accessorFn: (row) => row.doctor.name,
    header: "Médico",
    cell: ({ row }) => {
      return <div className="text-sm">{row.original.doctor.name}</div>;
    },
  },
  {
    id: "doctorSpecialty",
    accessorFn: (row) => row.doctor.specialty,
    header: "Especialidade",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground text-sm">
          {row.original.doctor.specialty}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="flex items-center gap-1">
          <Link href={`/appointments/${appointment.id}`}>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
          <UpsertAppointmentAction
            appointment={{
              id: appointment.id,
              date: appointment.date,
              appointmentPriceInCents: appointment.appointmentPriceInCents,
              paymentStatus: appointment.paymentStatus,
              appointmentStatus: appointment.appointmentStatus,
              notes: appointment.notes,
              clinicId: appointment.clinicId,
              patientId: appointment.patient.id,
              doctorId: appointment.doctorId,
              createdAt: appointment.createdAt,
              updatedAt: appointment.updatedAt,
            }}
            patients={patients}
            doctors={doctors}
          >
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </UpsertAppointmentAction>

          {/* Botão Cancelar - apenas para consultas futuras, não pagas e não canceladas */}
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const appointmentDate = new Date(appointment.date);
            appointmentDate.setHours(0, 0, 0, 0);

            const isFuture = appointmentDate >= today;
            const isNotPaid = appointment.paymentStatus !== "paid";
            const isNotCancelled =
              appointment.appointmentStatus !== "cancelled";

            return isFuture && isNotPaid && isNotCancelled ? (
              <CancelAppointmentButton
                appointmentId={appointment.id}
                patientName={appointment.patient.name}
                appointmentDate={new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(appointment.date))}
              >
                <Button variant="ghost" size="sm">
                  <Ban className="h-4 w-4" />
                </Button>
              </CancelAppointmentButton>
            ) : null;
          })()}

          {/* Botão Reativar - apenas para consultas canceladas e futuras */}
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const appointmentDate = new Date(appointment.date);
            appointmentDate.setHours(0, 0, 0, 0);

            const isFuture = appointmentDate >= today;
            const isCancelled = appointment.appointmentStatus === "cancelled";

            return isFuture && isCancelled ? (
              <ReactivateAppointmentButton
                appointmentId={appointment.id}
                patientName={appointment.patient.name}
                appointmentDate={new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(appointment.date))}
              >
                <Button variant="ghost" size="sm">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </ReactivateAppointmentButton>
            ) : null;
          })()}
        </div>
      );
    },
  },
];
