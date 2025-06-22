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

import EditPatientButton from "../_components/edit-patient-button";
import DeletePatientButton from "../_components/delete-patient-button";

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
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/patients">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <PageTitle>Detalhes do Paciente</PageTitle>
              <PageDescription>
                Informações completas sobre {patient.name}
              </PageDescription>
            </div>
          </div>
        </PageHeaderContent>        <PageActions>
          <div className="flex items-center space-x-2">
            <EditPatientButton 
              patient={{
                id: patient.id,
                name: patient.name,
                email: patient.email,
                phoneNumber: patient.phoneNumber,
                sex: patient.sex,
              }}
            />
            <DeletePatientButton 
              patientId={patient.id}
              patientName={patient.name}
            />
          </div>
        </PageActions>
      </PageHeader>
      
      <PageContent>
        <div className="space-y-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações Pessoais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nome Completo
                </label>
                <p className="text-sm font-medium">{patient.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Sexo
                </label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {patient.sex === "male" ? "Masculino" : "Feminino"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{patient.email}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Telefone
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{patient.phoneNumber}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Data de Cadastro
                </label>
                <p className="text-sm">
                  {new Date(patient.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
                <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Última Atualização
                </label>
                <p className="text-sm">
                  {patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString("pt-BR") : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Consultas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Histórico de Consultas</span>
            </CardTitle>
            <CardDescription>
              {appointments.length} consulta{appointments.length !== 1 ? "s" : ""} {appointments.length > 0 ? "encontrada" + (appointments.length !== 1 ? "s" : "") : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg bg-muted/10"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium">
                          Dr(a). {appointment.doctor.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor.specialty}
                        </p>
                        <p className="text-sm">
                          {new Date(appointment.date).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(appointment.date) > new Date() ? "Agendada" : "Realizada"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma consulta encontrada</p>
                <p className="text-sm">
                  Este paciente ainda não possui consultas agendadas ou realizadas.
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
