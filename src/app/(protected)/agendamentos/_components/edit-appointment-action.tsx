"use client";

import { useState, ReactNode } from "react";
import { Edit } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface EditAppointmentActionProps {
  appointmentId: string;
  children: ReactNode;
}

export function EditAppointmentAction({
  appointmentId,
  children,
}: EditAppointmentActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEditClick = () => {
    // Por enquanto, vamos apenas mostrar um toast informando que a funcionalidade será implementada
    toast.info(
      "Funcionalidade de editar agendamento será implementada em breve!",
    );
  };

  return <div onClick={handleEditClick}>{children}</div>;
}
