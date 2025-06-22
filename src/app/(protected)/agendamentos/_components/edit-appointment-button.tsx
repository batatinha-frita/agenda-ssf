"use client";

import { useState } from "react";
import { Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UpsertAppointmentForm } from "./upsert-appointment-form";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

interface EditAppointmentButtonProps {
  appointment: typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
    doctor: typeof doctorsTable.$inferSelect;
  };
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

export function EditAppointmentButton({ 
  appointment, 
  patients, 
  doctors 
}: EditAppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    // Recarregar a página para mostrar os dados atualizados
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Editar consulta
        </Button>
      </DialogTrigger>
      <UpsertAppointmentForm
        appointment={appointment}
        patients={patients}
        doctors={doctors}
        onSuccess={handleSuccess}
      />
    </Dialog>
  );
}
