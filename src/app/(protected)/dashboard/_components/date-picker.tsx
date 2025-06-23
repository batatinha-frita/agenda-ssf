"use client";

import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import { parseAsIsoDate, useQueryState } from "nuqs";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [from, setFrom] = useQueryState(
    "from",
    parseAsIsoDate.withDefault(new Date()),
  );
  const [to, setTo] = useQueryState(
    "to",
    parseAsIsoDate.withDefault(dayjs().add(1, "month").toDate()),
  );

  const handleDateSelect = (dateRange: DateRange | undefined) => {
    if (dateRange?.from) {
      setFrom(dateRange.from, {
        shallow: false,
      });
    }
    if (dateRange?.to) {
      setTo(dateRange.to, {
        shallow: false,
      });
    }
  };

  const handlePresetSelect = (preset: { from: Date; to: Date }) => {
    setFrom(preset.from, { shallow: false });
    setTo(preset.to, { shallow: false });
  };

  const date = {
    from,
    to,
  };

  const presets = [
    {
      label: "Hoje",
      from: new Date(),
      to: new Date(),
    },
    {
      label: "Ontem",
      from: dayjs().subtract(1, "day").toDate(),
      to: dayjs().subtract(1, "day").toDate(),
    },
    {
      label: "Esta semana",
      from: dayjs().startOf("week").toDate(), // Domingo
      to: dayjs().startOf("week").add(6, "days").toDate(), // Sábado
    },
    {
      label: "Últimos 7 dias",
      from: dayjs().subtract(6, "days").toDate(),
      to: new Date(),
    },
    {
      label: "Este mês",
      from: dayjs().startOf("month").toDate(),
      to: dayjs().endOf("month").toDate(),
    },
  ];
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {dayjs(date.from).format("MMM DD, YYYY")} -{" "}
                  {dayjs(date.to).format("MMM DD, YYYY")}
                </>
              ) : (
                dayjs(date.from).format("MMM DD, YYYY")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-auto flex-col space-y-2 p-2"
          align="start"
        >
          <div className="flex flex-col space-y-1">
            <h4 className="leading-none font-medium">Períodos rápidos</h4>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>{" "}
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
