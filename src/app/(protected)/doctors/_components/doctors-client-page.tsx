"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import DoctorCard from "./doctor-card";
import { doctorsTable } from "@/db/schema";
import { Stethoscope } from "lucide-react";

interface DoctorsClientPageProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
}

export function DoctorsClientPage({ doctors }: DoctorsClientPageProps) {
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredDoctors(doctors);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = doctors.filter(doctor => 
      doctor.name.toLowerCase().includes(lowercaseQuery) ||
      doctor.specialty.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredDoctors(filtered);
  };
  return (
    <div className="mt-8">
      <SearchBar 
        placeholder="Pesquisar médicos por nome ou especialidade..."
        className="mb-6"
        onSearch={handleSearch}
      />
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Stethoscope}
          title="Nenhum médico encontrado"
          description="Tente uma pesquisa diferente ou adicione um novo médico à sua clínica."
        />
      )}
    </div>
  );
}
