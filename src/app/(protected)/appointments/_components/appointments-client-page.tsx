"use client";

import { useState, useMemo } from "react";
import { format, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentsTable } from "./appointments-table";
import { AppointmentsFilters } from "./appointments-filters";
import { AppointmentsSummary } from "./appointments-summary";
import { AppointmentsActions } from "./appointments-actions";
import { useAppointmentsExport } from "@/hooks/use-appointments-export";
import { appointmentsTable, patientsTable, doctorsTable } from "@/db/schema";

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
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  addButton?: React.ReactNode;
}

export function AppointmentsClientPage({
  appointments,
  patients,
  doctors,
  addButton,
}: AppointmentsClientPageProps) {
  const [filteredAppointments, setFilteredAppointments] =
    useState(appointments);
  const { exportToExcel, printAppointments } = useAppointmentsExport();

  const handleFiltersChange = (filters: {
    dateFrom: Date;
    dateTo: Date;
    doctorId?: string;
    searchQuery: string;
  }) => {
    let filtered = appointments;

    // Filtrar por período
    filtered = filtered.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return isWithinInterval(appointmentDate, {
        start: filters.dateFrom,
        end: filters.dateTo,
      });
    });

    // Filtrar por médico
    if (filters.doctorId) {
      filtered = filtered.filter(
        (appointment) => appointment.doctor.id === filters.doctorId,
      );
    }

    // Filtrar por busca
    if (filters.searchQuery.trim()) {
      const lowercaseQuery = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((appointment) => {
        const formattedDate = format(
          new Date(appointment.date),
          "dd/MM/yyyy, HH:mm",
          { locale: ptBR },
        );

        return (
          appointment.patient.name.toLowerCase().includes(lowercaseQuery) ||
          appointment.doctor.name.toLowerCase().includes(lowercaseQuery) ||
          appointment.doctor.specialty.toLowerCase().includes(lowercaseQuery) ||
          formattedDate.toLowerCase().includes(lowercaseQuery)
        );
      });
    }

    setFilteredAppointments(filtered);
  };

  return (
    <div className="space-y-6">
      <AppointmentsActions
        onExportExcel={() => exportToExcel(filteredAppointments)}
        onPrint={() => printAppointments(filteredAppointments)}
        addButton={addButton}
      />

      <AppointmentsSummary appointments={filteredAppointments} />

      <AppointmentsFilters
        doctors={doctors}
        onFiltersChange={handleFiltersChange}
      />

      <AppointmentsTable
        appointments={filteredAppointments}
        patients={patients}
        doctors={doctors}
      />
    </div>
  );
}
