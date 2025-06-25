"use client";

import { Trash2 } from "lucide-react";
import { useState, ReactNode } from "react";
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
  patientName?: string;
  children?: ReactNode;
  redirectAfterDelete?: boolean;
}

export function DeleteAppointmentButton({
  appointmentId,
  patientName,
  children,
  redirectAfterDelete = false,
}: DeleteAppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      toast.success("Consulta deletada com sucesso!");
      setIsOpen(false);

      if (redirectAfterDelete) {
        router.push("/appointments");
      } else {
        // Recarregar a página para mostrar os dados atualizados
        window.location.reload();
      }
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
        {children || (
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar consulta
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar consulta</AlertDialogTitle>
          <AlertDialogDescription>
            {patientName
              ? `Tem certeza que deseja deletar a consulta do paciente ${patientName}?`
              : "Tem certeza que deseja deletar esta consulta?"}{" "}
            Esta ação não pode ser desfeita.
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
