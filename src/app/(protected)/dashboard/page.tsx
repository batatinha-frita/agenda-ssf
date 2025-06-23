import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getDashboard } from "@/data/get-dashboard";
import { db } from "@/db";
import { doctorsTable, patientsTable } from "@/db/schema";

import { auth } from "@/lib/auth";

import WeeklyAppointmentsChart from "./_components/weekly-appointments-chart";
import { DatePicker } from "./_components/date-picker";
import StatsCards from "./_components/stats-cards";
import TopDoctors from "./_components/top-doctors";
import TopSpecialties from "./_components/top-specialties";
import { TodayAppointmentsTable } from "./_components/today-appointments-table";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  const { from, to } = await searchParams;
  if (!from || !to) {
    // Calcular domingo da semana atual (início da semana)
    const today = dayjs();
    const startOfWeek = today.startOf("week"); // Domingo
    const endOfWeek = startOfWeek.add(6, "days"); // Sábado

    redirect(
      `/dashboard?from=${startOfWeek.format("YYYY-MM-DD")}&to=${endOfWeek.format("YYYY-MM-DD")}`,
    );
  }
  const {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
    weeklyAppointmentsData,
  } = await getDashboard({
    from,
    to,
    session: {
      user: {
        clinic: {
          id: session.user.clinic.id,
        },
      },
    },
  });
  // Buscar pacientes e médicos para as colunas da tabela
  const [patients, doctors] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic!.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic!.id),
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Tenha uma visão geral da sua clínica.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>{" "}
      <PageContent>
        <div className="space-y-3">
          {/* Cards de Estatísticas */}
          <StatsCards
            totalRevenue={
              totalRevenue.total ? Number(totalRevenue.total) : null
            }
            totalAppointments={totalAppointments.total}
            totalPatients={totalPatients.total}
            totalDoctors={totalDoctors.total}
          />

          {/* Gráfico de Pacientes + Top Médicos */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {" "}
            <div className="lg:col-span-2">
              <WeeklyAppointmentsChart
                weeklyAppointmentsData={weeklyAppointmentsData}
                from={from}
                to={to}
              />
            </div>
            <div className="lg:col-span-1">
              <TopDoctors doctors={topDoctors} />
            </div>
          </div>

          {/* Agendamentos Recentes + Top Especialidades */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="h-fit">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm">
                      Agendamentos Recentes
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <TodayAppointmentsTable
                    appointments={todayAppointments}
                    patients={patients}
                    doctors={doctors}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <TopSpecialties topSpecialties={topSpecialties} />
            </div>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
