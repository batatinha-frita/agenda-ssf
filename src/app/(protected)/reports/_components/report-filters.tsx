import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, Calendar } from "lucide-react";
import dayjs from "dayjs";

export interface ReportFilters {
  from: string;
  to: string;
  doctorId?: string;
  patientId?: string;
  status?: string;
  specialty?: string;
}

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  showDoctorFilter?: boolean;
  showPatientFilter?: boolean;
  showStatusFilter?: boolean;
  showSpecialtyFilter?: boolean;
  statusOptions?: { value: string; label: string }[];
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
}

export function ReportFiltersComponent({
  filters,
  onFiltersChange,
  showDoctorFilter = false,
  showPatientFilter = false,
  showStatusFilter = false,
  showSpecialtyFilter = false,
  statusOptions = [],
  searchPlaceholder = "Buscar...",
  onSearch,
}: ReportFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const setQuickDate = (days: number) => {
    const to = dayjs().format("YYYY-MM-DD");
    const from = dayjs().subtract(days, "days").format("YYYY-MM-DD");
    onFiltersChange({ ...filters, from, to });
  };

  return (
    <Card className="no-print mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros de data */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="from">Data Inicial</Label>
              <Input
                id="from"
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange("from", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">Data Final</Label>
              <Input
                id="to"
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange("to", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Período Rápido</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDate(30)}
                  className="text-xs"
                >
                  30 dias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDate(90)}
                  className="text-xs"
                >
                  90 dias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDate(365)}
                  className="text-xs"
                >
                  1 ano
                </Button>
              </div>
            </div>
            {onSearch && (
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filtros específicos */}
          {(showDoctorFilter ||
            showPatientFilter ||
            showStatusFilter ||
            showSpecialtyFilter) && (
            <div className="grid gap-4 md:grid-cols-4">
              {showDoctorFilter && (
                <div className="space-y-2">
                  <Label htmlFor="doctor">Médico</Label>
                  <Select
                    value={filters.doctorId || ""}
                    onValueChange={(value) =>
                      handleFilterChange("doctorId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os médicos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os médicos</SelectItem>
                      {/* TODO: Carregar lista de médicos */}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showPatientFilter && (
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Select
                    value={filters.patientId || ""}
                    onValueChange={(value) =>
                      handleFilterChange("patientId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os pacientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os pacientes</SelectItem>
                      {/* TODO: Carregar lista de pacientes */}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showStatusFilter && statusOptions.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status || ""}
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showSpecialtyFilter && (
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select
                    value={filters.specialty || ""}
                    onValueChange={(value) =>
                      handleFilterChange("specialty", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as especialidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as especialidades</SelectItem>
                      {/* TODO: Carregar lista de especialidades */}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
