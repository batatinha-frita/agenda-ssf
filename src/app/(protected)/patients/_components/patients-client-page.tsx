"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import { PatientsTable } from "./patients-table";
import { patientsTable } from "@/db/schema";

interface PatientsClientPageProps {
  patients: (typeof patientsTable.$inferSelect)[];
}

export function PatientsClientPage({ patients }: PatientsClientPageProps) {
  const [filteredPatients, setFilteredPatients] = useState(patients);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(lowercaseQuery) ||
        patient.email.toLowerCase().includes(lowercaseQuery) ||
        patient.phoneNumber.toLowerCase().includes(lowercaseQuery),
    );

    setFilteredPatients(filtered);
  };

  return (
    <div className="mt-8">
      <SearchBar
        placeholder="Pesquisar pacientes por nome, email ou telefone..."
        className="mb-6"
        onSearch={handleSearch}
      />
      <PatientsTable patients={filteredPatients} />
    </div>
  );
}
