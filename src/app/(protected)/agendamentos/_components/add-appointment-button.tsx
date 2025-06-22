"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { doctorsTable, patientsTable } from "@/db/schema";
import { CalendarPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { UpsertAppointmentForm } from "./upsert-appointment-form";

interface AddAppointmentButtonProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

export function AddAppointmentButton({
  patients,
  doctors,
}: AddAppointmentButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Reset do formulário quando o dialog fechar
  useEffect(() => {
    if (!dialogOpen) {
      setResetKey(prev => prev + 1);
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarPlus />
          Agendar consulta
        </Button>
      </DialogTrigger>
      <UpsertAppointmentForm
        key={resetKey}
        patients={patients}
        doctors={doctors}
        onSuccess={() => setDialogOpen(false)}
      />
    </Dialog>
  );
}
