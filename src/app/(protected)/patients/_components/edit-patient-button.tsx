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
    cpf?: string | null;
    birthDate?: string | null;
    cep?: string | null;
    logradouro?: string | null;
    numero?: string | null;
    complemento?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    observations?: string | null;
  };
  children?: React.ReactNode;
}

const EditPatientButton = ({ patient, children }: EditPatientButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Editar paciente
          </Button>
        )}
      </DialogTrigger>{" "}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
          <DialogDescription>
            Atualize as informações do paciente.
          </DialogDescription>
        </DialogHeader>{" "}
        <UpsertPatientForm
          defaultValues={{
            id: patient.id,
            name: patient.name,
            email: patient.email,
            phoneNumber: patient.phoneNumber,
            sex: patient.sex,
            cpf: patient.cpf || "",
            birthDate: patient.birthDate || "",
            cep: patient.cep || "",
            logradouro: patient.logradouro || "",
            numero: patient.numero || "",
            complemento: patient.complemento || "",
            emergencyContact: patient.emergencyContact || "",
            emergencyPhone: patient.emergencyPhone || "",
            observations: patient.observations || "",
          }}
          onSuccess={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export { EditPatientButton };
