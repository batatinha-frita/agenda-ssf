"use client";

import { RotateCcw } from "lucide-react";
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
import { reactivateAppointment } from "@/actions/reactivate-appointment";

interface ReactivateAppointmentButtonProps {
  appointmentId: string;
  patientName?: string;
  appointmentDate?: string;
  children?: ReactNode;
  redirectAfterReactivate?: boolean;
}

export function ReactivateAppointmentButton({
  appointmentId,
  patientName,
  appointmentDate,
  children,
  redirectAfterReactivate = false,
}: ReactivateAppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const reactivateAppointmentAction = useAction(reactivateAppointment, {
    onSuccess: () => {
      toast.success("Consulta reativada com sucesso!");
      setIsOpen(false);

      if (redirectAfterReactivate) {
        router.push("/appointments");
      } else {
        // Recarregar a página para mostrar os dados atualizados
        window.location.reload();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao reativar consulta.");
    },
  });

  const handleReactivate = () => {
    reactivateAppointmentAction.execute({ appointmentId });
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reativar consulta
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-green-500" />
            Reativar Consulta
          </AlertDialogTitle>
          <AlertDialogDescription>
            {patientName && appointmentDate ? (
              <>
                Confirma a reativação da consulta de{" "}
                <strong>{patientName}</strong> para{" "}
                <strong>{appointmentDate}</strong>?
              </>
            ) : patientName ? (
              <>
                Confirma a reativação da consulta de{" "}
                <strong>{patientName}</strong>?
              </>
            ) : (
              "Confirma a reativação desta consulta?"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="mb-2 text-sm font-medium text-green-700">
            ✅ Esta ação irá:
          </p>
          <ul className="space-y-1 text-sm text-green-600">
            <li>• Alterar o status para "Confirmado"</li>
            <li>• Reabrir o agendamento</li>
            <li>• Tornar o horário ocupado novamente</li>
          </ul>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReactivate}
            disabled={reactivateAppointmentAction.status === "executing"}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {reactivateAppointmentAction.status === "executing"
              ? "Reativando..."
              : "Reativar Consulta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
