"use client";

import { useState, ReactNode } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UpsertAppointmentForm } from "./upsert-appointment-form";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

interface EditAppointmentActionProps {
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
    doctor: typeof doctorsTable.$inferSelect;
  };
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  children: ReactNode;
}

export function EditAppointmentAction({
  appointment,
  patients,
  doctors,
  children,
}: EditAppointmentActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    // Recarregar a página para mostrar os dados atualizados
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <UpsertAppointmentForm
        appointment={appointment}
        patients={patients}
        doctors={doctors}
        onSuccess={handleSuccess}
      />
    </Dialog>
  );
}
