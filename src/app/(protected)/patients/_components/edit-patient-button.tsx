"use client";

import { Edit } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import UpsertPatientForm from "./upsert-patient-form";

interface EditPatientButtonProps {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  children?: React.ReactNode;
}

const EditPatientButton = ({ patient, children }: EditPatientButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <div className="flex w-full cursor-pointer items-center px-2 py-1.5 text-sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </div>
        )}
      </DialogTrigger>{" "}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
          <DialogDescription>
            Atualize as informações do paciente.
          </DialogDescription>
        </DialogHeader>
        <UpsertPatientForm
          defaultValues={{
            id: patient.id,
            name: patient.name,
            email: patient.email,
            phoneNumber: patient.phoneNumber,
            sex: patient.sex,
          }}
          onSuccess={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export { EditPatientButton };
