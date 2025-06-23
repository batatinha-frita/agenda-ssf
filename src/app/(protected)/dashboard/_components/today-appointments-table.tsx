"use client";

import { DataTable } from "@/components/ui/data-table";
import { appointmentsTable, patientsTable, doctorsTable } from "@/db/schema";
import { createAppointmentsColumns } from "./appointments-columns";

type TodayAppointment = typeof appointmentsTable.$inferSelect & {
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

interface TodayAppointmentsTableProps {
  appointments: TodayAppointment[];
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

export function TodayAppointmentsTable({
  appointments,
  patients,
  doctors,
}: TodayAppointmentsTableProps) {
  const appointmentsColumns = createAppointmentsColumns({ patients, doctors });
  return (
    <div className="max-h-[300px] overflow-auto">
      <DataTable
        columns={appointmentsColumns}
        data={appointments}
        searchPlaceholder="Pesquisar agendamentos..."
        searchKey="patientName"
        showPagination={false}
      />
    </div>
  );
}
