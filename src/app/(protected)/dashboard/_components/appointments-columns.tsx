"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { appointmentsTable, patientsTable, doctorsTable } from "@/db/schema";
import { UpsertAppointmentAction } from "../../appointments/_components/upsert-appointment-action";
import { DeleteAppointmentButton } from "../../appointments/_components/delete-appointment-button";

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
              ...appointment,
              patient: patients.find((p) => p.id === appointment.patient.id)!,
              doctor: doctors.find((d) => d.id === appointment.doctorId)!,
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
      );
    },
  },
];
