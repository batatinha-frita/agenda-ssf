import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, User, Calendar } from "lucide-react";
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

  // Buscar agendamentos do paciente
  const appointments = await db.query.appointmentsTable.findMany({
    where: eq(appointmentsTable.patientId, patientId),
    with: {
      doctor: true,
    },
    orderBy: (appointments, { desc }) => [desc(appointments.date)],
  });
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center space-x-2">
            <Link href="/patients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <PageTitle>Detalhes do Paciente</PageTitle>
          <PageDescription>
            Informações completas sobre {patient.name}
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <EditPatientButton
            patient={{
              id: patient.id,
              name: patient.name,
              email: patient.email,
              phoneNumber: patient.phoneNumber,
              sex: patient.sex,
            }}
          />{" "}
          <DeletePatientButton
            patientId={patient.id}
            patientName={patient.name}
          />
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Pessoais */}
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
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Sexo
                </label>
                <p className="text-sm">
                  {patient.sex === "male" ? "Masculino" : "Feminino"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Cadastro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Informações de Cadastro</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Data de Cadastro
                </label>
                <p className="text-sm">
                  {new Date(patient.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Última Atualização
                </label>
                <p className="text-sm">
                  {patient.updatedAt
                    ? new Date(patient.updatedAt).toLocaleDateString("pt-BR")
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Consultas */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
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
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <Link
                      key={appointment.id}
                      href={`/appointments/${appointment.id}`}
                      className="block"
                    >
                      <div className="bg-muted/10 hover:bg-muted/20 rounded-lg border p-4 transition-colors">
                        <div className="flex items-start justify-between">
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
                          <Badge variant="outline">
                            {new Date(appointment.date) > new Date()
                              ? "Agendada"
                              : "Realizada"}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Nenhuma consulta encontrada</p>
                  <p className="text-sm">
                    Este paciente ainda não possui consultas agendadas ou
                    realizadas.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default PatientDetailsPage;
