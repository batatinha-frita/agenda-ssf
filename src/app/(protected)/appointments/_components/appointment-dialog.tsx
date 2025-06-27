"use client";

import { Plus, Edit } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { AppointmentForm } from "./appointment-form";

interface AppointmentDialogProps {
  appointment?: typeof appointmentsTable.$inferSelect;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  children?: React.ReactNode;
}

export function AppointmentDialog({
  appointment,
  patients,
  doctors,
  children,
}: AppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isEditing = !!appointment;

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Quando o modal fecha, aguarda um pouco para garantir que o estado seja limpo
    if (!open) {
      setTimeout(() => {
        // Força uma re-renderização limpa do formulário
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
                Agendar consulta
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <AppointmentForm
        appointment={appointment}
        patients={patients}
        doctors={doctors}
        onSuccess={handleSuccess}
      />
    </Dialog>
  );
}
