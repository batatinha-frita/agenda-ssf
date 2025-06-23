import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Stethoscope,
  User,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { UpsertAppointmentButton } from "../_components/upsert-appointment-button";
import { DeleteAppointmentButton } from "../_components/delete-appointment-button";

interface AppointmentDetailsPageProps {
  params: Promise<{
    appointmentId: string;
  }>;
}

const AppointmentDetailsPage = async ({
  params,
}: AppointmentDetailsPageProps) => {
  const { appointmentId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  // Buscar o agendamento
  const appointment = await db.query.appointmentsTable.findFirst({
    where: eq(appointmentsTable.id, appointmentId),
    with: {
      patient: true,
      doctor: true,
    },
  });

  if (!appointment || appointment.clinicId !== session.user.clinic.id) {
    notFound();
  }
  // Buscar todos os pacientes e médicos da clínica para o formulário de edição
  const [patients, doctors] = await Promise.all([
    db.query.patientsTable.findMany({
      where: (patients, { eq }) =>
        eq(patients.clinicId, session.user.clinic!.id),
    }),
    db.query.doctorsTable.findMany({
      where: (doctors, { eq }) => eq(doctors.clinicId, session.user.clinic!.id),
    }),
  ]);
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center space-x-2">
            <Link href="/appointments">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <PageTitle>Detalhes do Agendamento</PageTitle>
          <PageDescription>
            Informações completas sobre o agendamento
          </PageDescription>
        </PageHeaderContent>{" "}
        <PageActions>
          <UpsertAppointmentButton
            appointment={appointment}
            patients={patients}
            doctors={doctors}
          />
          <DeleteAppointmentButton
            appointmentId={appointment.id}
            redirectAfterDelete={true}
          />
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Paciente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Nome
                </label>
                <p className="text-lg font-semibold">
                  {appointment.patient.name}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Email
                </label>
                <p className="text-sm">{appointment.patient.email}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Telefone
                </label>
                <p className="text-sm">{appointment.patient.phoneNumber}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Sexo
                </label>
                <p className="text-sm">
                  {appointment.patient.sex === "male"
                    ? "Masculino"
                    : "Feminino"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Médico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5" />
                <span>Médico</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Nome
                </label>
                <p className="text-lg font-semibold">
                  Dr(a). {appointment.doctor.name}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Especialidade
                </label>
                <p className="text-sm">{appointment.doctor.specialty}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Agendamento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Data e Horário
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <p className="text-lg font-semibold">
                    {format(
                      new Date(appointment.date),
                      "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                      {
                        locale: ptBR,
                      },
                    )}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Criado em
                </label>
                <p className="text-sm">
                  {format(
                    new Date(appointment.createdAt),
                    "dd/MM/yyyy 'às' HH:mm",
                    {
                      locale: ptBR,
                    },
                  )}
                </p>
              </div>
              {appointment.updatedAt &&
                appointment.updatedAt !== appointment.createdAt && (
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Última atualização
                    </label>
                    <p className="text-sm">
                      {format(
                        new Date(appointment.updatedAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        {
                          locale: ptBR,
                        },
                      )}
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Financeiro</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Valor da Consulta
                </label>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(appointment.appointmentPriceInCents / 100)}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Status do Pagamento
                </label>
                <div className="mt-1">
                  <Badge
                    variant={
                      appointment.paymentStatus === "paid"
                        ? "default"
                        : appointment.paymentStatus === "overdue"
                          ? "destructive"
                          : "secondary"
                    }
                    className={
                      appointment.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : appointment.paymentStatus === "overdue"
                          ? ""
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    }
                  >
                    {appointment.paymentStatus === "paid"
                      ? "Pago"
                      : appointment.paymentStatus === "overdue"
                        ? "Atrasado"
                        : "Em Aberto"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {appointment.notes && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Observações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {appointment.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentDetailsPage;
