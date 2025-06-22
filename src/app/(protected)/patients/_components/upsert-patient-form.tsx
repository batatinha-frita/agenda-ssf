"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";

import { upsertPatientAction } from "@/actions/upsert-patient";
import { Button } from "@/components/ui/button";
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

import {
  upsertPatientSchema,
  type UpsertPatientSchema,
} from "@/actions/upsert-patient/schema";

interface UpsertPatientFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<UpsertPatientSchema>;
}

const UpsertPatientForm = ({
  onSuccess,
  defaultValues,
}: UpsertPatientFormProps) => {
  const { execute: executeUpsertPatient, isExecuting } = useAction(
    upsertPatientAction,
    {
      onSuccess: () => {
        toast.success("Paciente salvo com sucesso!");
        onSuccess?.();
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro ao salvar paciente");
      },
    },
  );

  const form = useForm<UpsertPatientSchema>({
    resolver: zodResolver(upsertPatientSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      sex: undefined,
      ...defaultValues,
    },
  });

  const onSubmit = (data: UpsertPatientSchema) => {
    executeUpsertPatient(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Paciente</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Digite o email do paciente"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Telefone</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="(##) #####-####"
                    mask="_"
                    customInput={Input}
                    placeholder="(11) 99999-9999"
                    onValueChange={(values) => {
                      field.onChange(values.value);
                    }}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={isExecuting}>
            {isExecuting ? "Salvando..." : "Salvar Paciente"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UpsertPatientForm;
