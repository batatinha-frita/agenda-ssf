"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { patientsTable } from "@/db/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Edit, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { EditPatientButton } from "./edit-patient-button";
import { DeletePatientButton } from "./delete-patient-button";

interface PatientsTableProps {
  patients: (typeof patientsTable.$inferSelect)[];
}

export function PatientsTable({ patients }: PatientsTableProps) {
  if (patients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum paciente cadastrado ainda"
        description="Clique em 'Adicionar Paciente' para começar a gerenciar seus pacientes."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Celular</TableHead>
            <TableHead>Sexo</TableHead>
            <TableHead>Cadastrado</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {patient.email}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {patient.phoneNumber}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    patient.sex === "male"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                  }
                >
                  {patient.sex === "male" ? "Masculino" : "Feminino"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(patient.createdAt), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link href={`/patients/${patient.id}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <EditPatientButton patient={patient}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </EditPatientButton>
                  <DeletePatientButton
                    patientId={patient.id}
                    patientName={patient.name}
                  >
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DeletePatientButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
