"use client";

import { Trash } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deletePatientAction } from "@/actions/delete-patient";
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
import { Button } from "@/components/ui/button";

interface DeletePatientButtonProps {
  patientId: string;
  patientName: string;
}

const DeletePatientButton = ({
  patientId,
  patientName,
}: DeletePatientButtonProps) => {
  const router = useRouter();

  const { execute: executeDeletePatient, isExecuting } = useAction(
    deletePatientAction,
    {
      onSuccess: () => {
        toast.success("Paciente deletado com sucesso!");
        router.push("/patients");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao deletar paciente");
      },
    },
  );

  const handleDeletePatient = () => {
    executeDeletePatient({ id: patientId });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="text-destructive flex w-full cursor-pointer items-center px-2 py-1.5 text-sm">
          <Trash className="mr-2 h-4 w-4" />
          Deletar
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja deletar este paciente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser revertida. Isso irá deletar permanentemente o
            paciente <strong>{patientName}</strong> e todas as consultas
            associadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeletePatient}
            disabled={isExecuting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isExecuting ? "Deletando..." : "Deletar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { DeletePatientButton };
