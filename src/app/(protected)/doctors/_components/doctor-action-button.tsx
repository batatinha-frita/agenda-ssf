"use client";

import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { doctorsTable } from "@/db/schema";
import { deleteDoctor } from "@/actions/delete-doctor";

import UpsertDoctorForm from "./upsert-doctor-form";

interface DoctorActionButtonProps {
  doctor: typeof doctorsTable.$inferSelect;
}

export function DoctorActionButton({ doctor }: DoctorActionButtonProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deleteDoctorAction = useAction(deleteDoctor, {
    onSuccess: () => {
      toast.success("Médico deletado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao deletar médico");
    },
  });

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja deletar este médico?")) {
      deleteDoctorAction.execute({ id: doctor.id });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive"
            disabled={deleteDoctorAction.isExecuting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteDoctorAction.isExecuting ? "Deletando..." : "Excluir"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <UpsertDoctorForm
          doctor={doctor}
          onSuccess={() => setIsEditOpen(false)}
        />
      </Dialog>
    </>
  );
}
