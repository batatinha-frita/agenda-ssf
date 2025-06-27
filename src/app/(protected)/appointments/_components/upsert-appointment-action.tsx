"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AppointmentDialog } from "./appointment-dialog";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

interface UpsertAppointmentActionProps {
  appointment?: typeof appointmentsTable.$inferSelect;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  children?: React.ReactNode;
}

export function UpsertAppointmentAction({
  appointment,
  patients,
  doctors,
  children,
}: UpsertAppointmentActionProps) {
  const isEditing = !!appointment;

  const trigger = children || (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      {isEditing ? "Editar Consulta" : "Nova Consulta"}
    </Button>
  );

  return (
    <AppointmentDialog
      appointment={appointment}
      patients={patients}
      doctors={doctors}
    >
      {trigger}
    </AppointmentDialog>
  );
}
