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
}

const EditPatientButton = ({ patient }: EditPatientButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center px-2 py-1.5 text-sm cursor-pointer w-full">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
