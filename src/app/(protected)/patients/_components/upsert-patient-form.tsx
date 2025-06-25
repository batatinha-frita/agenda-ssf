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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  upsertPatientSchema,
  type UpsertPatientData,
} from "@/actions/upsert-patient/schema";

interface UpsertPatientFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<UpsertPatientData>;
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
  const form = useForm<UpsertPatientData>({
    resolver: zodResolver(upsertPatientSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      sex: undefined,
      cpf: "",
      birthDate: "",
      // Campos de endereço
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      emergencyContact: "",
      emergencyPhone: "",
      observations: "",
      ...defaultValues,
    },
  });

  const onSubmit = (data: UpsertPatientData) => {
    executeUpsertPatient(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          />{" "}
        </div>

        {/* Seção de Dados Complementares (Opcionais) */}
        <div className="space-y-4 border-t pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              📋 Dados Complementares (Opcionais)
            </h3>
            <p className="text-muted-foreground text-sm">
              Informações adicionais que podem ser preenchidas conforme
              necessário
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* CPF */}
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <PatternFormat
                      format="###.###.###-##"
                      mask="_"
                      customInput={Input}
                      placeholder="000.000.000-00"
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
            {/* Data de Nascimento */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="Selecione a data"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />{" "}
          </div>

          {/* Seção de Endereço */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-md text-muted-foreground font-medium">
                🏠 Endereço
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* CEP */}
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="#####-###"
                        mask="_"
                        customInput={Input}
                        placeholder="00000-000"
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

              {/* Número */}
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Logradouro */}
              <FormField
                control={form.control}
                name="logradouro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua das Flores" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Complemento */}
              <FormField
                control={form.control}
                name="complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 101, Bloco A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Contato de Emergência */}
            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato de Emergência</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do contato de emergência"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone de Emergência */}
            <FormField
              control={form.control}
              name="emergencyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone de Emergência</FormLabel>
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

          {/* Observações */}
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações adicionais sobre o paciente (alergias, condições especiais, etc.)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={isExecuting}>
            {isExecuting ? "Salvando..." : "Salvar Paciente"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UpsertPatientForm;
