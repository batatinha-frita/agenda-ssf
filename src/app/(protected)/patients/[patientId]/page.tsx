import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  MapPin,
  Heart,
  FileText,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { patientsTable, appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { EditPatientButton } from "../_components/edit-patient-button";
import { DeletePatientButton } from "../_components/delete-patient-button";

interface PatientDetailsPageProps {
  params: Promise<{
    patientId: string;
  }>;
}

const PatientDetailsPage = async ({ params }: PatientDetailsPageProps) => {
  const { patientId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  // Buscar o paciente
  const patient = await db.query.patientsTable.findFirst({
    where: eq(patientsTable.id, patientId),
  });

  if (!patient || patient.clinicId !== session.user.clinic.id) {
    notFound();
  }
  // Buscar agendamentos do paciente com notas
  const appointments = await db.query.appointmentsTable.findMany({
    where: eq(appointmentsTable.patientId, patientId),
    with: {
      doctor: true,
      noteHistory: {
        orderBy: (notes, { desc }) => [desc(notes.createdAt)],
      },
    },
    orderBy: (appointments, { desc }) => [desc(appointments.date)],
  });
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center">
            <BackButton href="/patients" />
            <div>
              <PageTitle>Detalhes do Paciente</PageTitle>
              <PageDescription>
                Informações completas sobre {patient.name}
              </PageDescription>
            </div>
          </div>
        </PageHeaderContent>
        <PageActions>
          {" "}
          <EditPatientButton
            patient={{
              id: patient.id,
              name: patient.name,
              email: patient.email,
              phoneNumber: patient.phoneNumber,
              sex: patient.sex,
              cpf: patient.cpf,
              birthDate: patient.birthDate?.toISOString().split("T")[0],
              cep: patient.cep,
              logradouro: patient.logradouro,
              numero: patient.numero,
              complemento: patient.complemento,
              emergencyContact: patient.emergencyContact,
              emergencyPhone: patient.emergencyPhone,
              observations: patient.observations,
            }}
          />
          <DeletePatientButton
            patientId={patient.id}
            patientName={patient.name}
          />
        </PageActions>
      </PageHeader>{" "}
      <PageContent>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna da Esquerda - Informações Pessoais */}
          <div className="space-y-6 lg:col-span-1">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Nome Completo
                  </label>
                  <p className="text-lg font-semibold">{patient.name}</p>
                </div>

                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Sexo
                  </label>
                  <p className="text-sm">
                    {patient.sex === "male" ? "Masculino" : "Feminino"}
                  </p>
                </div>

                {patient.cpf && (
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      CPF
                    </label>
                    <p className="font-mono text-sm">{patient.cpf}</p>
                  </div>
                )}

                {patient.birthDate && (
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Data de Nascimento
                    </label>
                    <p className="text-sm">
                      {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações de Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Contato</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Email
                  </label>
                  <p className="text-sm">{patient.email}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Telefone
                  </label>
                  <p className="text-sm">{patient.phoneNumber}</p>
                </div>

                {(patient.emergencyContact || patient.emergencyPhone) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="flex items-center space-x-2 text-sm font-medium">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>Contato de Emergência</span>
                      </h4>

                      {patient.emergencyContact && (
                        <div>
                          <label className="text-muted-foreground text-sm font-medium">
                            Nome
                          </label>
                          <p className="text-sm">{patient.emergencyContact}</p>
                        </div>
                      )}

                      {patient.emergencyPhone && (
                        <div>
                          <label className="text-muted-foreground text-sm font-medium">
                            Telefone
                          </label>
                          <p className="text-sm">{patient.emergencyPhone}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Endereço */}
            {(patient.cep ||
              patient.logradouro ||
              patient.numero ||
              patient.complemento) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Endereço</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.cep && (
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        CEP
                      </label>
                      <p className="font-mono text-sm">{patient.cep}</p>
                    </div>
                  )}

                  {patient.logradouro && (
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Logradouro
                      </label>
                      <p className="text-sm">{patient.logradouro}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {patient.numero && (
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Número
                        </label>
                        <p className="text-sm">{patient.numero}</p>
                      </div>
                    )}

                    {patient.complemento && (
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Complemento
                        </label>
                        <p className="text-sm">{patient.complemento}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {patient.observations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Observações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {patient.observations}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Informações de Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Informações do Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Data de Cadastro
                  </label>
                  <p className="text-sm">
                    {new Date(patient.createdAt).toLocaleDateString("pt-BR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">
                    Última Atualização
                  </label>
                  <p className="text-sm">
                    {patient.updatedAt
                      ? new Date(patient.updatedAt).toLocaleDateString(
                          "pt-BR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da Direita - Histórico de Consultas */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5" />
                  <span>Histórico de Consultas</span>
                </CardTitle>
                <CardDescription>
                  {appointments.length} consulta
                  {appointments.length !== 1 ? "s" : ""}{" "}
                  {appointments.length > 0
                    ? "encontrada" + (appointments.length !== 1 ? "s" : "")
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="max-h-[800px] space-y-4 overflow-y-auto pr-2">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-muted/10 rounded-lg border p-4"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">
                              Dr(a). {appointment.doctor.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {appointment.doctor.specialty}
                            </p>
                            <p className="text-sm">
                              {new Date(appointment.date).toLocaleDateString(
                                "pt-BR",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="outline">
                              {appointment.appointmentStatus === "confirmed" &&
                                "Confirmada"}
                              {appointment.appointmentStatus === "pending" &&
                                "Pendente"}
                              {appointment.appointmentStatus === "cancelled" &&
                                "Cancelada"}
                              {appointment.appointmentStatus === "completed" &&
                                "Realizada"}
                            </Badge>
                            <Badge variant="secondary">
                              {appointment.paymentStatus === "paid" && "✓ Pago"}
                              {appointment.paymentStatus === "pending" &&
                                "⏳ Pendente"}
                              {appointment.paymentStatus === "overdue" &&
                                "⚠ Vencido"}
                            </Badge>
                          </div>
                        </div>

                        {/* Notas da Consulta */}
                        {(appointment.notes ||
                          appointment.noteHistory.length > 0) && (
                          <div className="mt-4 border-t pt-3">
                            <h4 className="mb-3 flex items-center space-x-2 text-sm font-medium">
                              <FileText className="h-4 w-4" />
                              <span>Notas da Consulta</span>
                            </h4>

                            {/* Nota principal */}
                            {appointment.notes && (
                              <div className="mb-3 rounded-md bg-blue-50 p-3">
                                <div className="text-muted-foreground mb-1 text-xs">
                                  Nota Principal
                                </div>
                                <p className="text-sm whitespace-pre-wrap">
                                  {appointment.notes}
                                </p>
                              </div>
                            )}

                            {/* Histórico de notas */}
                            {appointment.noteHistory.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-muted-foreground text-xs">
                                  Histórico de Notas (
                                  {appointment.noteHistory.length})
                                </div>
                                {appointment.noteHistory.map((note) => (
                                  <div
                                    key={note.id}
                                    className="rounded-md bg-gray-50 p-3"
                                  >
                                    <div className="mb-1 flex items-center justify-between">
                                      <span className="text-muted-foreground text-xs">
                                        {note.createdBy}
                                      </span>
                                      <span className="text-muted-foreground text-xs">
                                        {new Date(
                                          note.createdAt,
                                        ).toLocaleDateString("pt-BR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">
                                      {note.note}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Link para ver mais detalhes */}
                        <div className="mt-4 border-t pt-3">
                          <Link
                            href={`/appointments/${appointment.id}`}
                            className="text-primary hover:text-primary/80 inline-flex items-center space-x-1 text-sm font-medium"
                          >
                            <span>Ver detalhes da consulta</span>
                            <ArrowLeft className="h-3 w-3 rotate-180" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground py-12 text-center">
                    <Stethoscope className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p className="text-lg font-medium">
                      Nenhuma consulta encontrada
                    </p>
                    <p className="text-sm">
                      Este paciente ainda não possui consultas agendadas ou
                      realizadas.
                    </p>
                    <div className="mt-4">
                      <Link href="/appointments">
                        <Button variant="outline" size="sm">
                          Agendar Consulta
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default PatientDetailsPage;
