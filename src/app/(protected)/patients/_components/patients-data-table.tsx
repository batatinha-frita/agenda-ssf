"use client";

import { DataTable } from "@/components/ui/data-table";
import { patientsColumns, type Patient } from "./columns";

interface PatientsDataTableProps {
  data: Patient[];
}

export function PatientsDataTable({ data }: PatientsDataTableProps) {
  return (
    <DataTable
      columns={patientsColumns}
      data={data}
      searchPlaceholder="Pesquisar por nome do paciente..."
      searchKey="name"
    />
  );
}
