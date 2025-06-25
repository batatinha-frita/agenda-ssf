"use client";

import { Ban } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cancelAppointment } from "@/actions/cancel-appointment";

interface CancelAppointmentButtonProps {
  appointmentId: string;
  patientName?: string;
  appointmentDate?: string;
  children?: ReactNode;
  redirectAfterCancel?: boolean;
}

export function CancelAppointmentButton({
  appointmentId,
  patientName,
  appointmentDate,
  children,
  redirectAfterCancel = false,
}: CancelAppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const cancelAppointmentAction = useAction(cancelAppointment, {
    onSuccess: () => {
      toast.success("Consulta cancelada com sucesso!");
      setIsOpen(false);
      setReason("");

      if (redirectAfterCancel) {
        router.push("/appointments");
      } else {
        // Recarregar a página para mostrar os dados atualizados
        window.location.reload();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao cancelar consulta.");
    },
  });

  const handleCancel = () => {
    cancelAppointmentAction.execute({
      appointmentId,
      reason: reason.trim() || undefined,
    });
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Ban className="mr-2 h-4 w-4" />
            Cancelar consulta
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-orange-500" />
            Cancelar Consulta
          </AlertDialogTitle>
          <AlertDialogDescription>
            {patientName && appointmentDate ? (
              <>
                Confirma o cancelamento da consulta de{" "}
                <strong>{patientName}</strong> para{" "}
                <strong>{appointmentDate}</strong>?
              </>
            ) : patientName ? (
              <>
                Confirma o cancelamento da consulta de{" "}
                <strong>{patientName}</strong>?
              </>
            ) : (
              "Confirma o cancelamento desta consulta?"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="mb-2 text-sm font-medium text-orange-700">
              ⚠️ Esta ação irá:
            </p>
            <ul className="space-y-1 text-sm text-orange-600">
              <li>• Alterar o status para "Cancelado"</li>
              <li>• Alterar pagamento para "Em Aberto"</li>
              <li>• Liberar o horário para outros</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Paciente solicitou reagendamento, emergência médica..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={cancelAppointmentAction.status === "executing"}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            {cancelAppointmentAction.status === "executing"
              ? "Cancelando..."
              : "Cancelar Consulta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
