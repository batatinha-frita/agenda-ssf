"use client";

import { SearchBar } from "@/components/ui/search-bar";
import { useDoctorsFilter } from "./doctors-filter-context";

export function DoctorsSearchBar() {
  const { handleSearch } = useDoctorsFilter();

  return (
    <SearchBar
      placeholder="Pesquisar médicos por nome ou especialidade..."
      onSearch={handleSearch}
    />
  );
}
