"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import { AppointmentsTable } from "./appointments-table";
import { appointmentsTable } from "@/db/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentsClientPageProps {
  appointments: (typeof appointmentsTable.$inferSelect & {
    patient: {
      id: string;
      name: string;
    };
    doctor: {
      id: string;
      name: string;
      specialty: string;
    };
  })[];
}

export function AppointmentsClientPage({ appointments }: AppointmentsClientPageProps) {
  const [filteredAppointments, setFilteredAppointments] = useState(appointments);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredAppointments(appointments);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = appointments.filter(appointment => {
      const formattedDate = format(new Date(appointment.date), "dd/MM/yyyy, HH:mm", { locale: ptBR });
      
      return (
        appointment.patient.name.toLowerCase().includes(lowercaseQuery) ||
        appointment.doctor.name.toLowerCase().includes(lowercaseQuery) ||
        appointment.doctor.specialty.toLowerCase().includes(lowercaseQuery) ||
        formattedDate.toLowerCase().includes(lowercaseQuery)
      );
    });
    
    setFilteredAppointments(filtered);
  };

  return (
    <div className="mt-8">
      <SearchBar 
        placeholder="Pesquisar agendamentos por paciente, médico ou data..."
        className="mb-6"
        onSearch={handleSearch}
      />
      <AppointmentsTable appointments={filteredAppointments} />
    </div>
  );
}
