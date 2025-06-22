"use client";

import { Plus } from "lucide-react";
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

const AddPatientButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Paciente
        </Button>
      </DialogTrigger>{" "}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Paciente</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo paciente.
          </DialogDescription>
        </DialogHeader>
        <UpsertPatientForm onSuccess={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientButton;
