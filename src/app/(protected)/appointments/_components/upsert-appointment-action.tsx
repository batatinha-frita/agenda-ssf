"use client";

import { useState, ReactNode } from "react";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UpsertAppointmentForm } from "./upsert-appointment-form";

interface UpsertAppointmentActionProps {
  appointment?: typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
    doctor: typeof doctorsTable.$inferSelect;
  };
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  children: ReactNode;
}

export function UpsertAppointmentAction({
  appointment,
  patients,
  doctors,
  children,
}: UpsertAppointmentActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleSuccess = () => {
    setIsOpen(false);
    setResetKey((prev) => prev + 1);
    // Recarregar a página para mostrar os dados atualizados
    window.location.reload();
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <UpsertAppointmentForm
        key={resetKey}
        appointment={appointment}
        patients={patients}
        doctors={doctors}
        onSuccess={handleSuccess}
      />
    </Dialog>
  );
}
