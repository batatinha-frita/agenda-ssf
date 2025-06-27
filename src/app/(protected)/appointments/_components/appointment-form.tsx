"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAction } from "next-safe-action/hooks";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  DollarSign,
  FileText,
  CalendarIcon,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import {
  UpsertAppointmentFormData,
  upsertAppointmentSchema,
} from "@/actions/upsert-appointment/schema";
import { upsertAppointment } from "@/actions/upsert-appointment";

interface AppointmentFormProps {
  appointment?: typeof appointmentsTable.$inferSelect;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

export function AppointmentForm({
  appointment,
  patients,
  doctors,
  onSuccess,
}: AppointmentFormProps) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const isEditing = !!appointment;

  const form = useForm<UpsertAppointmentFormData>({
    resolver: zodResolver(upsertAppointmentSchema),
    defaultValues: {
      id: appointment?.id,
      patientId: appointment?.patientId || "",
      doctorId: appointment?.doctorId || "",
      date: appointment?.date ? new Date(appointment.date) : undefined,
      time: appointment?.date
        ? format(new Date(appointment.date), "HH:mm")
        : "",
      appointmentPriceInCents: appointment?.appointmentPriceInCents || 0,
      paymentStatus: appointment?.paymentStatus || "pending",
      appointmentStatus: appointment?.appointmentStatus || "confirmed",
      notes: appointment?.notes || "",
    },
  });

  // Reset form quando não há appointment (nova consulta)
  useEffect(() => {
    if (!appointment) {
      form.reset({
        id: undefined,
        patientId: "",
        doctorId: "",
        date: undefined,
        time: "",
        appointmentPriceInCents: 0,
        paymentStatus: "pending",
        appointmentStatus: "confirmed",
        notes: "",
      });
    }
  }, [appointment, form]);

  const { execute: executeUpsert, isExecuting } = useAction(upsertAppointment, {
    onSuccess: ({ data }) => {
      toast.success(
        isEditing
          ? "Consulta atualizada com sucesso!"
          : "Consulta agendada com sucesso!",
      );
      // Reset o formulário apenas quando for uma nova consulta (não edição)
      if (!isEditing) {
        form.reset({
          id: undefined,
          patientId: "",
          doctorId: "",
          date: undefined,
          time: "",
          appointmentPriceInCents: 0,
          paymentStatus: "pending",
          appointmentStatus: "confirmed",
          notes: "",
        });
      }
      onSuccess?.();
    },
    onError: ({ error }) => {
      console.error("Erro ao salvar consulta:", error);
      if (error.serverError) {
        toast.error(String(error.serverError));
      } else {
        toast.error("Erro ao salvar consulta. Tente novamente.");
      }
    },
  });

  const selectedDoctorId = form.watch("doctorId");
  const selectedDate = form.watch("date");

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === selectedDoctorId,
  );

  // Gerar horários disponíveis
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      const times = [];
      for (let hour = 8; hour <= 17; hour++) {
        if (hour !== 12) {
          times.push(`${hour.toString().padStart(2, "0")}:00`);
        }
      }
      setAvailableTimes(times);
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDoctorId, selectedDate]);

  // Aplicar valor sugerido
  const applyCurrentDoctorPrice = () => {
    if (selectedDoctor?.appointmentPriceInCents) {
      form.setValue(
        "appointmentPriceInCents",
        selectedDoctor.appointmentPriceInCents,
      );
      toast.success("Valor aplicado automaticamente!");
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const onSubmit = (values: UpsertAppointmentFormData) => {
    if (isExecuting) {
      return;
    }
    executeUpsert(values);
  };

  return (
    <DialogContent
      className="max-h-[95vh] w-[95vw] overflow-y-auto sm:w-[90vw]"
      style={{
        maxWidth: "min(66vw, 1200px)",
        minWidth: "320px",
      }}
    >
      <DialogHeader className="space-y-3 text-center">
        <DialogTitle className="flex items-center justify-center gap-3 text-xl">
          <div className="rounded-lg bg-blue-100 p-2">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          {isEditing ? "Editar Consulta" : "Agendar Nova Consulta"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground text-base">
          {isEditing
            ? "Modifique os dados da consulta existente conforme necessário."
            : "Preencha os dados abaixo para agendar uma nova consulta."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Layout principal em grid para telas grandes */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
            {/* SEÇÃO 1: QUEM PARTICIPA */}
            <Card className="h-fit border-green-200 bg-green-50/30">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-lg">
                  <User className="h-6 w-6 text-green-600" />
                  QUEM PARTICIPA
                </CardTitle>
                <CardDescription>
                  Selecione o paciente e o médico responsável pela consulta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-center gap-2 text-base font-medium">
                          <div className="rounded-md bg-green-100 p-1">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          Paciente
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 !w-full !justify-center text-center">
                              <SelectValue
                                placeholder="Selecione o paciente"
                                className="text-center"
                              />
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
                        <FormLabel className="flex items-center justify-center gap-2 text-base font-medium">
                          <div className="rounded-md bg-green-100 p-1">
                            <Stethoscope className="h-4 w-4 text-green-600" />
                          </div>
                          Médico
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 !w-full !justify-center text-center">
                              <SelectValue
                                placeholder="Selecione o médico"
                                className="text-center"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                <div className="flex flex-col py-1 text-center">
                                  <span className="font-medium">
                                    {doctor.name}
                                  </span>
                                  <span className="text-muted-foreground text-sm">
                                    {doctor.specialty} •{" "}
                                    {formatCurrency(
                                      doctor.appointmentPriceInCents,
                                    )}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEÇÃO 2: QUANDO SERÁ */}
            <Card className="h-fit border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  QUANDO SERÁ
                </CardTitle>
                <CardDescription>
                  Escolha a data e o horário da consulta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-center gap-2 text-base font-medium">
                        <div className="rounded-md bg-blue-100 p-1">
                          <CalendarIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        Data da consulta
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-12 w-full justify-center text-center text-base font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
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
                      <FormLabel className="flex items-center justify-center gap-2 text-base font-medium">
                        <div className="rounded-md bg-blue-100 p-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        Horário disponível
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-3">
                        {availableTimes.length > 0 ? (
                          availableTimes.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={
                                field.value === time ? "default" : "outline"
                              }
                              className={cn(
                                "h-10 text-sm",
                                field.value === time
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "hover:bg-blue-50",
                              )}
                              onClick={() => field.onChange(time)}
                            >
                              {time}
                            </Button>
                          ))
                        ) : (
                          <div className="text-muted-foreground col-span-3 py-4 text-center text-sm">
                            Selecione um médico e data primeiro
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* SEÇÃO 3: INFORMAÇÕES FINANCEIRAS */}
          <Card className="border-yellow-200 bg-yellow-50/30">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="flex items-center justify-center gap-3 text-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
                INFORMAÇÕES FINANCEIRAS
              </CardTitle>
              <CardDescription>
                Configure o valor, status de pagamento e status da consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              {/* Linha 1: Valor sugerido e Valor da consulta */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Valor sugerido */}
                {selectedDoctor && (
                  <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardHeader className="pb-3 text-center">
                      <CardTitle className="flex items-center justify-center gap-2 text-base">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        VALOR SUGERIDO
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-center">
                      <p className="mb-3 text-2xl font-bold text-blue-700">
                        {formatCurrency(selectedDoctor.appointmentPriceInCents)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={applyCurrentDoctorPrice}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        ✨ Aplicar
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Valor da consulta */}
                <Card className="border-green-200 bg-green-50/30">
                  <CardHeader className="pb-3 text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-base">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      VALOR DA CONSULTA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FormField
                      control={form.control}
                      name="appointmentPriceInCents"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <span className="text-muted-foreground absolute top-3 left-4 text-base">
                                R$
                              </span>
                              <Input
                                type="number"
                                placeholder="0,00"
                                className="h-12 pl-12 text-center text-base"
                                value={field.value ? field.value / 100 : ""}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  field.onChange(Math.round(value * 100));
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Linha 2: Status do pagamento e Status da consulta */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-orange-200 bg-orange-50/30">
                  <CardHeader className="pb-3 text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-base">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                      STATUS DO PAGAMENTO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FormField
                      control={form.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-3 gap-2"
                            >
                              <div className="flex items-center space-x-2 rounded-lg border border-orange-200 p-2 hover:bg-orange-100/50">
                                <RadioGroupItem
                                  value="pending"
                                  id="pending-payment"
                                />
                                <FormLabel
                                  htmlFor="pending-payment"
                                  className="flex cursor-pointer items-center gap-1 text-sm"
                                >
                                  🟡 Pendente
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2 rounded-lg border border-orange-200 p-2 hover:bg-orange-100/50">
                                <RadioGroupItem
                                  value="paid"
                                  id="paid-payment"
                                />
                                <FormLabel
                                  htmlFor="paid-payment"
                                  className="flex cursor-pointer items-center gap-1 text-sm"
                                >
                                  🟢 Pago
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2 rounded-lg border border-orange-200 p-2 hover:bg-orange-100/50">
                                <RadioGroupItem
                                  value="overdue"
                                  id="overdue-payment"
                                />
                                <FormLabel
                                  htmlFor="overdue-payment"
                                  className="flex cursor-pointer items-center gap-1 text-sm"
                                >
                                  🔴 Atrasado
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/30">
                  <CardHeader className="pb-3 text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-base">
                      <FileText className="h-5 w-5 text-purple-600" />
                      STATUS DA CONSULTA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FormField
                      control={form.control}
                      name="appointmentStatus"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-3 gap-2"
                            >
                              <div className="flex items-center space-x-2 rounded-lg border border-purple-200 p-2 hover:bg-purple-100/50">
                                <RadioGroupItem
                                  value="confirmed"
                                  id="confirmed-status"
                                />
                                <FormLabel
                                  htmlFor="confirmed-status"
                                  className="flex cursor-pointer items-center gap-1 text-sm"
                                >
                                  ✅ Confirmada
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2 rounded-lg border border-purple-200 p-2 hover:bg-purple-100/50">
                                <RadioGroupItem
                                  value="pending"
                                  id="pending-status"
                                />
                                <FormLabel
                                  htmlFor="pending-status"
                                  className="flex cursor-pointer items-center gap-1 text-sm"
                                >
                                  ⏳ Pendente
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2 rounded-lg border border-purple-200 p-2 hover:bg-purple-100/50">
                                <RadioGroupItem
                                  value="completed"
                                  id="completed-status"
                                />
                                <FormLabel
                                  htmlFor="completed-status"
                                  className="flex cursor-pointer items-center gap-1 text-sm"
                                >
                                  🎯 Concluída
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 4: OBSERVAÇÕES ADICIONAIS */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-6 text-center">
              <CardTitle className="flex items-center justify-center gap-3 text-lg">
                <FileText className="h-6 w-6 text-purple-600" />
                OBSERVAÇÕES ADICIONAIS
              </CardTitle>
              <CardDescription>
                Adicione informações adicionais sobre a consulta (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Observações adicionais
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite observações sobre a consulta, sintomas do paciente, instruções especiais..."
                        className="min-h-[100px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <DialogFooter className="-mx-6 -mb-6 border-t bg-gray-50/50 px-6 pt-6 pb-6">
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1"
                onClick={() => onSuccess?.()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isExecuting}
                className="h-12 flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isExecuting && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                {isEditing ? "💾 Salvar Alterações" : "📅 Agendar Consulta"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
