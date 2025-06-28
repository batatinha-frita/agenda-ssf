"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { doctorsTable } from "@/db/schema";

type Doctor = typeof doctorsTable.$inferSelect;

interface DoctorsFilterContextType {
  allDoctors: Doctor[];
  filteredDoctors: Doctor[];
  handleSearch: (query: string) => void;
}

const DoctorsFilterContext = createContext<DoctorsFilterContextType | null>(null);

interface DoctorsFilterProviderProps {
  doctors: Doctor[];
  children: ReactNode;
}

export function DoctorsFilterProvider({ doctors, children }: DoctorsFilterProviderProps) {
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

  return (
    <DoctorsFilterContext.Provider 
      value={{ 
        allDoctors: doctors, 
        filteredDoctors, 
        handleSearch 
      }}
    >
      {children}
    </DoctorsFilterContext.Provider>
  );
}

export function useDoctorsFilter() {
  const context = useContext(DoctorsFilterContext);
  if (!context) {
    throw new Error("useDoctorsFilter must be used within DoctorsFilterProvider");
  }
  return context;
}
