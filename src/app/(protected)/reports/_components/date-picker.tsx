"use client";

import { useState, useCallback, memo } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  from: string;
  to: string;
  onDateChange: (from: string, to: string) => void;
  className?: string;
}

export const DatePicker = memo(function DatePicker({
  from,
  to,
  onDateChange,
  className,
}: DatePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(from),
    to: new Date(to),
  });

  const handleDateSelect = useCallback(
    (dateRange: DateRange | undefined) => {
      setDate(dateRange);
      if (dateRange?.from) {
        const fromDate = dayjs(dateRange.from).format("YYYY-MM-DD");
        const toDate = dateRange?.to
          ? dayjs(dateRange.to).format("YYYY-MM-DD")
          : fromDate;
        onDateChange(fromDate, toDate);
      }
    },
    [onDateChange],
  );

  const handlePresetSelect = useCallback(
    (preset: { from: Date; to: Date }) => {
      const newDate = { from: preset.from, to: preset.to };
      setDate(newDate);
      onDateChange(
        dayjs(preset.from).format("YYYY-MM-DD"),
        dayjs(preset.to).format("YYYY-MM-DD"),
      );
    },
    [onDateChange],
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {dayjs(date.from).format("DD/MM/YYYY")} -{" "}
                  {dayjs(date.to).format("DD/MM/YYYY")}
                </>
              ) : (
                dayjs(date.from).format("DD/MM/YYYY")
              )
            ) : (
              <span>Selecione o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">
                Períodos predefinidos
              </h4>
              <div className="grid gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handlePresetSelect({
                      from: dayjs().subtract(7, "days").toDate(),
                      to: dayjs().toDate(),
                    })
                  }
                  className="justify-start"
                >
                  Últimos 7 dias
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handlePresetSelect({
                      from: dayjs().subtract(1, "month").toDate(),
                      to: dayjs().toDate(),
                    })
                  }
                  className="justify-start"
                >
                  Último mês
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handlePresetSelect({
                      from: dayjs().subtract(3, "months").toDate(),
                      to: dayjs().toDate(),
                    })
                  }
                  className="justify-start"
                >
                  Últimos 3 meses
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handlePresetSelect({
                      from: dayjs().startOf("year").toDate(),
                      to: dayjs().endOf("year").toDate(),
                    })
                  }
                  className="justify-start"
                >
                  Este ano
                </Button>
              </div>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>{" "}
      </Popover>
    </div>
  );
});
