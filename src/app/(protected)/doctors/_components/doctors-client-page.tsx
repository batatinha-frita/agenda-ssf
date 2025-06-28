"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import { DoctorsTable } from "./doctors-table";
import { doctorsTable } from "@/db/schema";

interface DoctorsClientPageProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
  showSearchOnly?: boolean;
  showTableOnly?: boolean;
}

export function DoctorsClientPage({
  doctors,
  showSearchOnly = false,
  showTableOnly = false,
}: DoctorsClientPageProps) {
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredDoctors(doctors);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(lowercaseQuery) ||
        doctor.specialty.toLowerCase().includes(lowercaseQuery),
    );

    setFilteredDoctors(filtered);
  };

  // Se for apenas para mostrar a pesquisa
  if (showSearchOnly) {
    return (
      <SearchBar
        placeholder="Pesquisar médicos por nome ou especialidade..."
        onSearch={handleSearch}
      />
    );
  }

  // Se for apenas para mostrar a tabela
  if (showTableOnly) {
    return <DoctorsTable doctors={filteredDoctors} />;
  }

  // Layout padrão (compatibilidade com uso anterior)
  return (
    <div className="mt-8">
      <SearchBar
        placeholder="Pesquisar médicos por nome ou especialidade..."
        className="mb-6"
        onSearch={handleSearch}
      />
      <DoctorsTable doctors={filteredDoctors} />
    </div>
  );
}
