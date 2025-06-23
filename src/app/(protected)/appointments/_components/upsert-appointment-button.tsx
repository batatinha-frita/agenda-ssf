"use client";

import { Plus, Edit } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import { UpsertAppointmentForm } from "./upsert-appointment-form";

interface UpsertAppointmentButtonProps {
  appointment?: typeof appointmentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
    doctor: typeof doctorsTable.$inferSelect;
  };
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  children?: React.ReactNode;
}

export function UpsertAppointmentButton({
  appointment,
  patients,
  doctors,
  children,
}: UpsertAppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const isEditing = !!appointment;

  const handleSuccess = () => {
    setIsOpen(false);
    setResetKey((prev) => prev + 1);
    // Recarregar a página para mostrar os dados atualizados
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={isEditing ? "outline" : "default"} size="sm">
            {isEditing ? (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Editar consulta
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar consulta
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
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
