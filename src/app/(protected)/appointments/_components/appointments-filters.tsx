"use client";

import { useState } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  addDays,
  addWeeks,
  addMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable } from "@/db/schema";

interface AppointmentsFiltersProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
  onFiltersChange: (filters: {
    dateFrom: Date;
    dateTo: Date;
    doctorId?: string;
    searchQuery: string;
  }) => void;
}

export function AppointmentsFilters({
  doctors,
  onFiltersChange,
}: AppointmentsFiltersProps) {
  const [dateFrom, setDateFrom] = useState<Date>(startOfDay(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfDay(addDays(new Date(), 30)));
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("todos");

  const quickFilters = [
    {
      id: "todos",
      label: "Todos",
      getDateRange: () => {
        // Mostra últimos 6 meses até próximos 6 meses
        const sixMonthsAgo = addMonths(new Date(), -6);
        const sixMonthsLater = addMonths(new Date(), 6);
        return {
          from: startOfDay(sixMonthsAgo),
          to: endOfDay(sixMonthsLater),
        };
      },
    },
    {
      id: "hoje",
      label: "Hoje",
      getDateRange: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
      }),
    },
    {
      id: "amanha",
      label: "Amanhã",
      getDateRange: () => {
        const tomorrow = addDays(new Date(), 1);
        return {
          from: startOfDay(tomorrow),
          to: endOfDay(tomorrow),
        };
      },
    },
    {
      id: "proximos-7",
      label: "Próximos 7 dias",
      getDateRange: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(addDays(new Date(), 7)),
      }),
    },
    {
      id: "proximos-30",
      label: "Próximos 30 dias",
      getDateRange: () => ({
        from: startOfDay(new Date()),
        to: endOfDay(addDays(new Date(), 30)),
      }),
    },
  ];

  const handleQuickFilter = (filterId: string) => {
    const filter = quickFilters.find((f) => f.id === filterId);
    if (filter) {
      const range = filter.getDateRange();
      setDateFrom(range.from);
      setDateTo(range.to);
      setActiveQuickFilter(filterId);

      onFiltersChange({
        dateFrom: range.from,
        dateTo: range.to,
        doctorId: selectedDoctor === "all" ? undefined : selectedDoctor,
        searchQuery,
      });
    }
  };

  const handleCustomDateChange = () => {
    setActiveQuickFilter("custom");
    onFiltersChange({
      dateFrom,
      dateTo,
      doctorId: selectedDoctor === "all" ? undefined : selectedDoctor,
      searchQuery,
    });
  };

  const handleDoctorChange = (value: string) => {
    setSelectedDoctor(value);
    onFiltersChange({
      dateFrom,
      dateTo,
      doctorId: value === "all" ? undefined : value,
      searchQuery,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFiltersChange({
      dateFrom,
      dateTo,
      doctorId: selectedDoctor === "all" ? undefined : selectedDoctor,
      searchQuery: value,
    });
  };

  return (
    <div className="bg-card space-y-4 rounded-lg border p-4">
      <div className="flex flex-col space-y-4">
        {/* Filtros Rápidos e Período Personalizado na mesma linha */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Filtros Rápidos */}
          <div>
            <h3 className="text-muted-foreground mb-2 text-sm font-medium">
              Filtros Rápidos
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={
                    activeQuickFilter === filter.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleQuickFilter(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Período Personalizado */}
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-medium">
              Período Personalizado
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  Data Inicial
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateFrom, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={(date) => {
                        if (date) {
                          setDateFrom(startOfDay(date));
                          handleCustomDateChange();
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  Data Final
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateTo, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={(date) => {
                        if (date) {
                          setDateTo(endOfDay(date));
                          handleCustomDateChange();
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        {/* Filtro por Médico e Busca */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-muted-foreground mb-2 block text-sm font-medium">
              Médico
            </label>
            <Select value={selectedDoctor} onValueChange={handleDoctorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os médicos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os médicos</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-muted-foreground mb-2 block text-sm font-medium">
              Buscar
            </label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                placeholder="Buscar por paciente, médico..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
