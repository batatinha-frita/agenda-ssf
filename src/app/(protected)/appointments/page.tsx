import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { AppointmentDialog } from "./_components/appointment-dialog";
import { AppointmentsClientPage } from "./_components/appointments-client-page";

const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/authentication");
  }

  // Buscar a clínica do usuário
  const userClinic = await db.query.usersToClinicsTable.findFirst({
    where: (usersToClinics, { eq }) =>
      eq(usersToClinics.userId, session.user.id),
    with: {
      clinic: true,
    },
  });

  if (!userClinic) {
    redirect("/clinic-form");
  }

  // Buscar pacientes da clínica
  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, userClinic.clinic.id),
    orderBy: (patients, { asc }) => [asc(patients.name)],
  });

  // Buscar médicos da clínica
  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, userClinic.clinic.id),
    orderBy: (doctors, { asc }) => [asc(doctors.name)],
  });

  // Buscar agendamentos da clínica
  const appointments = await db.query.appointmentsTable.findMany({
    where: eq(appointmentsTable.clinicId, userClinic.clinic.id),
    with: {
      patient: true,
      doctor: true,
    },
    orderBy: (appointments, { desc }) => [desc(appointments.date)],
  });

  return (
    <PageContainer>
      <AppointmentsClientPage
        appointments={appointments}
        patients={patients}
        doctors={doctors}
        addButton={
          <AppointmentDialog
            key="appointment-dialog"
            patients={patients}
            doctors={doctors}
          />
        }
      />
    </PageContainer>
  );
};

export default AppointmentsPage;
