"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAppointment } from "@/actions/delete-appointment";

interface DeleteAppointmentButtonProps {
  appointmentId: string;
}

export function DeleteAppointmentButton({
  appointmentId,
}: DeleteAppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      toast.success("Consulta deletada com sucesso!");
      setIsOpen(false);
      router.push("/agendamentos");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao deletar consulta.");
    },
  });

  const handleDelete = () => {
    deleteAppointmentAction.execute({ appointmentId });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Deletar consulta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar consulta</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar esta consulta? Esta ação não pode ser
            desfeita. Apenas o registro da consulta será removido, os dados do
            paciente e médico permanecerão.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteAppointmentAction.status === "executing"}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteAppointmentAction.status === "executing"
              ? "Deletando..."
              : "Deletar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
