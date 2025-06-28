"use client";

import { DoctorsTable } from "./doctors-table";
import { useDoctorsFilter } from "./doctors-filter-context";

export function DoctorsTableContainer() {
  const { filteredDoctors } = useDoctorsFilter();

  return <DoctorsTable doctors={filteredDoctors} />;
}
