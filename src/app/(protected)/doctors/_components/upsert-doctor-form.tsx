"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertDoctor } from "@/actions/upsert-doctor";
import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  specialty: z.string().trim().min(1, {
    message: "Especialidade é obrigatória.",
  }),
  appointmentPriceInCents: z.number().min(1, {
    message: "Preço da consulta é obrigatório.",
  }),
  availableFromWeekDay: z.number().min(0).max(6),
  availableToWeekDay: z.number().min(0).max(6),
  availableFromTime: z.string().min(1, {
    message: "Hora de início é obrigatória.",
  }),
  availableToTime: z.string().min(1, {
    message: "Hora de término é obrigatória.",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface UpsertDoctorFormProps {
  doctor?: typeof doctorsTable.$inferSelect;
  onSuccess?: () => void;
}

export default function UpsertDoctorForm({
  doctor,
  onSuccess,
}: UpsertDoctorFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: doctor?.name || "",
      specialty: doctor?.specialty || "",
      appointmentPriceInCents: doctor?.appointmentPriceInCents || 0,
      availableFromWeekDay: doctor?.availableFromWeekDay || 1,
      availableToWeekDay: doctor?.availableToWeekDay || 5,
      availableFromTime: doctor?.availableFromTime || "08:00:00",
      availableToTime: doctor?.availableToTime || "18:00:00",
    },
  });

  const { execute, isExecuting } = useAction(upsertDoctor, {
    onSuccess: () => {
      toast.success(
        doctor
          ? "Médico atualizado com sucesso!"
          : "Médico adicionado com sucesso!",
      );
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao salvar médico");
    },
  });

  const onSubmit = (data: FormData) => {
    execute({
      id: doctor?.id,
      ...data,
    });
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {doctor ? "Editar médico" : "Adicionar médico"}
        </DialogTitle>
        <DialogDescription>
          {doctor
            ? "Atualize as informações do médico."
            : "Adicione um novo médico à sua clínica."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do médico" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidade</FormLabel>
                <FormControl>
                  <Input placeholder="Especialidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentPriceInCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    {...field}
                    value={field.value ? (field.value / 100).toFixed(2) : ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(Math.round(value * 100));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="availableFromWeekDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia inicial</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Domingo</SelectItem>
                      <SelectItem value="1">Segunda</SelectItem>
                      <SelectItem value="2">Terça</SelectItem>
                      <SelectItem value="3">Quarta</SelectItem>
                      <SelectItem value="4">Quinta</SelectItem>
                      <SelectItem value="5">Sexta</SelectItem>
                      <SelectItem value="6">Sábado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableToWeekDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia final</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Domingo</SelectItem>
                      <SelectItem value="1">Segunda</SelectItem>
                      <SelectItem value="2">Terça</SelectItem>
                      <SelectItem value="3">Quarta</SelectItem>
                      <SelectItem value="4">Quinta</SelectItem>
                      <SelectItem value="5">Sexta</SelectItem>
                      <SelectItem value="6">Sábado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="availableFromTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário inicial</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      step="3600"
                      {...field}
                      value={field.value?.slice(0, 5) || ""}
                      onChange={(e) => field.onChange(e.target.value + ":00")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableToTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário final</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      step="3600"
                      {...field}
                      value={field.value?.slice(0, 5) || ""}
                      onChange={(e) => field.onChange(e.target.value + ":00")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting
                ? "Salvando..."
                : doctor
                  ? "Atualizar médico"
                  : "Adicionar médico"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
