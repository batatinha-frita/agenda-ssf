"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";

import { upsertAppointment } from "@/actions/upsert-appointment";
import { getAppointments } from "@/actions/get-appointments";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

const formSchema = z.object({
  patientId: z.string().min(1, {
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().min(1, {
    message: "Médico é obrigatório.",
  }),
  date: z.date({
    required_error: "Data é obrigatória.",
  }),
  time: z.string().min(1, {
    message: "Horário é obrigatório.",
  }),
  appointmentPrice: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),
  paymentStatus: z.enum(["paid", "pending", "overdue"], {
    required_error: "Status de pagamento é obrigatório.",
  }),
  notes: z.string().optional(),
});

interface UpsertAppointmentFormProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  appointment?: typeof appointmentsTable.$inferSelect;
  onSuccess?: () => void;
}

export function UpsertAppointmentForm({
  patients,
  doctors,
  appointment,
  onSuccess,
}: UpsertAppointmentFormProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<
    typeof doctorsTable.$inferSelect | null
  >(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Date[]>([]);
  const [selectKey, setSelectKey] = useState(0); // Força re-render do Select
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: appointment?.patientId ?? "",
      doctorId: appointment?.doctorId ?? "",
      date: appointment?.date ? new Date(appointment.date) : undefined,
      time: appointment?.date
        ? format(new Date(appointment.date), "HH:mm")
        : "",
      appointmentPrice: appointment?.appointmentPriceInCents
        ? appointment.appointmentPriceInCents / 100
        : 0,
      paymentStatus: appointment?.paymentStatus ?? "pending",
      notes: appointment?.notes ?? "",
    },
  });
  const upsertAppointmentAction = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      onSuccess?.();
    },
    onError: ({ error }) => {
      console.error("Erro ao criar agendamento:", error);
      toast.error(error.serverError || "Erro ao criar agendamento.");
    },
  });

  const getAppointmentsAction = useAction(getAppointments);

  const patientId = form.watch("patientId");
  const doctorId = form.watch("doctorId");
  const selectedDate = form.watch("date");
  // Atualizar médico selecionado quando o médico mudar
  useEffect(() => {
    if (doctorId) {
      const doctor = doctors.find((d) => d.id === doctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
        // Atualizar o preço no formulário se não estiver editando
        if (!appointment) {
          form.setValue(
            "appointmentPrice",
            doctor.appointmentPriceInCents / 100,
          );
        }
      }
    } else {
      setSelectedDoctor(null);
      if (!appointment) {
        form.setValue("appointmentPrice", 0);
      }
    }
  }, [doctorId, doctors, form, appointment]);
  // Buscar agendamentos existentes quando médico e data mudarem
  const fetchExistingAppointments = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      const result = await getAppointmentsAction.executeAsync({
        doctorId: selectedDoctor.id,
        date: selectedDate,
      });

      if (result?.data) {
        setExistingAppointments(
          result.data.map((dateStr) => new Date(dateStr)),
        );
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      setAvailableTimes([]);
    }
  }, [selectedDoctor, selectedDate, getAppointmentsAction]);

  // Gerar horários disponíveis
  const generateAvailableTimes = useCallback(() => {
    if (!selectedDoctor || !selectedDate) return;

    const dayOfWeek = selectedDate.getDay();

    // Verificar se a data está no intervalo de dias disponíveis do médico
    const isDateAvailable =
      (selectedDoctor.availableFromWeekDay <=
        selectedDoctor.availableToWeekDay &&
        dayOfWeek >= selectedDoctor.availableFromWeekDay &&
        dayOfWeek <= selectedDoctor.availableToWeekDay) ||
      (selectedDoctor.availableFromWeekDay >
        selectedDoctor.availableToWeekDay &&
        (dayOfWeek >= selectedDoctor.availableFromWeekDay ||
          dayOfWeek <= selectedDoctor.availableToWeekDay));

    if (!isDateAvailable) {
      setAvailableTimes([]);
      return;
    }

    const times: string[] = [];
    // Garantir formato HH:mm (cortar segundos se vier HH:mm:ss)
    const startTime = (selectedDoctor.availableFromTime || "08:00").slice(0, 5);
    const endTime = (selectedDoctor.availableToTime || "18:00").slice(0, 5);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startDateTime = dayjs().hour(startHour).minute(startMinute).second(0);

    const endDateTime = dayjs().hour(endHour).minute(endMinute).second(0);

    let currentTime = startDateTime;
    while (currentTime.isBefore(endDateTime)) {
      const timeString = currentTime.format("HH:mm");

      // Verificar se este horário já está ocupado
      const timeToCheck = dayjs(selectedDate)
        .hour(currentTime.hour())
        .minute(currentTime.minute())
        .toDate();

      const isOccupied = existingAppointments.some((existingDate) => {
        const existing = dayjs(existingDate);
        const check = dayjs(timeToCheck);
        return existing.isSame(check, "minute");
      });

      // Só adicionar se não estiver ocupado ou se for o agendamento atual sendo editado
      if (
        !isOccupied ||
        (appointment &&
          appointment.date &&
          dayjs(appointment.date).isSame(timeToCheck, "minute"))
      ) {
        times.push(timeString);
      }

      currentTime = currentTime.add(30, "minute"); // Intervalos de 30 minutos
    }

    setAvailableTimes(times);
  }, [selectedDoctor, selectedDate, existingAppointments, appointment]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchExistingAppointments();
    }
  }, [fetchExistingAppointments]);

  // Gerar horários disponíveis quando os agendamentos existentes mudarem
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      generateAvailableTimes();
    } else {
      setAvailableTimes([]);
    }
  }, [generateAvailableTimes, selectedDoctor, selectedDate]);

  // Limpar horário selecionado quando os horários disponíveis mudarem
  useEffect(() => {
    if (availableTimes.length > 0) {
      // Se não está editando um agendamento existente, limpar o horário
      if (!appointment) {
        form.setValue("time", "");
      }
      // Força re-render do Select
      setSelectKey((prev) => prev + 1);
    }
  }, [availableTimes, appointment, form]);
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertAppointmentAction.execute({
      ...values,
      id: appointment?.id,
      appointmentPriceInCents: values.appointmentPrice * 100,
    });
  };

  const isDateFieldDisabled = !patientId || !doctorId;
  const isTimeFieldDisabled = !patientId || !doctorId || !selectedDate;
  return (
    <DialogContent className="max-h-[90vh] max-w-7xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {appointment ? "Editar consulta" : "Agendar consulta"}
        </DialogTitle>
        <DialogDescription>
          {appointment
            ? "Edite os dados da consulta existente."
            : "Preencha os dados para agendar uma nova consulta."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        {" "}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Linha 1: Paciente e Médico */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médico</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um médico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Informação do valor padrão */}
          {selectedDoctor && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">
                  Valor padrão da consulta:
                </span>
                <span className="text-lg font-semibold text-green-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(selectedDoctor.appointmentPriceInCents / 100)}
                </span>
              </div>
            </div>
          )}

          {/* Linha 2: Valor da consulta e Status do pagamento */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {" "}
            <FormField
              control={form.control}
              name="appointmentPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da consulta</FormLabel>
                  <FormControl>
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      disabled={!selectedDoctor}
                      value={field.value}
                      onValueChange={(values) => {
                        field.onChange(values.floatValue || 0);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Você pode ajustar o valor para aplicar desconto ou
                    acréscimo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />{" "}
            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status do pagamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Em Aberto</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="overdue">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Status atual do pagamento da consulta.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Linha 3: Data e Horário */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {" "}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          disabled={isDateFieldDisabled}
                          data-empty={!field.value}
                          className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Horário ({availableTimes.length} disponíveis)
                  </FormLabel>
                  <Select
                    key={selectKey}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isTimeFieldDisabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />{" "}
          </div>

          {/* Linha 4: Observações (largura completa) */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Adicione observações sobre o agendamento..."
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Informações adicionais sobre o agendamento ou paciente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                onSuccess?.();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? appointment
                  ? "Salvando..."
                  : "Agendando..."
                : appointment
                  ? "Salvar alterações"
                  : "Agendar consulta"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
