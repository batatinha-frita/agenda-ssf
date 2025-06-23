import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import {
  clinicsTable,
  doctorsTable,
  patientsTable,
  appointmentsTable,
} from "./src/db/schema";
import dayjs from "dayjs";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_daPtO0HM7bsZ@ep-silent-morning-acerbkur-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require";

async function seedTestData() {
  const client = postgres(DATABASE_URL);
  const db = drizzle(client);

  try {
    console.log("Inserindo dados de teste...");

    // Verificar se já existem dados de teste
    const existingClinics = await db
      .select()
      .from(clinicsTable)
      .where(eq(clinicsTable.name, "Clínica de Testes"));

    let clinic;
    if (existingClinics.length > 0) {
      clinic = existingClinics[0];
      console.log("Usando clínica existente:", clinic.id);
    } else {
      [clinic] = await db
        .insert(clinicsTable)
        .values({
          name: "Clínica de Testes",
        })
        .returning();
      console.log("Clínica criada:", clinic.id);
    }

    // Inserir médico
    const existingDoctors = await db
      .select()
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, clinic.id));
    let doctor;
    if (existingDoctors.length > 0) {
      doctor = existingDoctors[0];
      console.log("Usando médico existente:", doctor.id);
    } else {
      [doctor] = await db
        .insert(doctorsTable)
        .values({
          clinicId: clinic.id,
          name: "Dr. João Silva",
          specialty: "Cardiologia",
          appointmentPriceInCents: 15000,
          availableFromWeekDay: 1,
          availableToWeekDay: 5,
          availableFromTime: "08:00",
          availableToTime: "18:00",
        })
        .returning();
      console.log("Médico criado:", doctor.id);
    }

    // Inserir pacientes
    const existingPatients = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinic.id));
    let patients;
    if (existingPatients.length >= 4) {
      patients = existingPatients.slice(0, 4);
      console.log("Usando pacientes existentes:", patients.length);
    } else {
      patients = await db
        .insert(patientsTable)
        .values([
          {
            clinicId: clinic.id,
            name: "Maria Santos",
            email: "maria@email.com",
            phoneNumber: "(11) 99999-1111",
            sex: "female",
          },
          {
            clinicId: clinic.id,
            name: "João Silva",
            email: "joao@email.com",
            phoneNumber: "(11) 99999-2222",
            sex: "male",
          },
          {
            clinicId: clinic.id,
            name: "Ana Costa",
            email: "ana@email.com",
            phoneNumber: "(11) 99999-3333",
            sex: "female",
          },
          {
            clinicId: clinic.id,
            name: "Pedro Oliveira",
            email: "pedro@email.com",
            phoneNumber: "(11) 99999-4444",
            sex: "male",
          },
        ])
        .returning();
      console.log("Pacientes criados:", patients.length);
    }

    // Limpar consultas antigas de teste
    await db
      .delete(appointmentsTable)
      .where(eq(appointmentsTable.clinicId, clinic.id));

    // Inserir consultas de teste
    const today = dayjs();
    const appointments = [
      // Consultas pagas (passadas)
      {
        clinicId: clinic.id,
        doctorId: doctor.id,
        patientId: patients[0].id,
        date: today.subtract(10, "days").toDate(),
        appointmentPriceInCents: 15000,
        paymentStatus: "paid" as const,
        appointmentStatus: "completed" as const,
      },
      {
        clinicId: clinic.id,
        doctorId: doctor.id,
        patientId: patients[1].id,
        date: today.subtract(5, "days").toDate(),
        appointmentPriceInCents: 15000,
        paymentStatus: "paid" as const,
        appointmentStatus: "completed" as const,
      },
      // Consultas em aberto (futuras)
      {
        clinicId: clinic.id,
        doctorId: doctor.id,
        patientId: patients[2].id,
        date: today.add(3, "days").toDate(),
        appointmentPriceInCents: 20000,
        paymentStatus: "pending" as const,
        appointmentStatus: "confirmed" as const,
      },
      {
        clinicId: clinic.id,
        doctorId: doctor.id,
        patientId: patients[3].id,
        date: today.add(7, "days").toDate(),
        appointmentPriceInCents: 18000,
        paymentStatus: "pending" as const,
        appointmentStatus: "confirmed" as const,
      },
      // Consultas em atraso
      {
        clinicId: clinic.id,
        doctorId: doctor.id,
        patientId: patients[0].id,
        date: today.subtract(15, "days").toDate(),
        appointmentPriceInCents: 15000,
        paymentStatus: "pending" as const,
        appointmentStatus: "completed" as const,
      },
      {
        clinicId: clinic.id,
        doctorId: doctor.id,
        patientId: patients[1].id,
        date: today.subtract(20, "days").toDate(),
        appointmentPriceInCents: 15000,
        paymentStatus: "overdue" as const,
        appointmentStatus: "completed" as const,
      },
    ];

    await db.insert(appointmentsTable).values(appointments);

    console.log("✅ Dados de teste inseridos com sucesso!");
    console.log("\nResumo:");
    console.log("- Clínica:", clinic.name, `(${clinic.id})`);
    console.log("- Médico:", doctor.name, `(${doctor.id})`);
    console.log("- Pacientes:", patients.length);
    console.log("- Consultas:", appointments.length);
    console.log("\nStatus das consultas:");
    console.log("- Pagas: 2 consultas = R$ 300,00");
    console.log("- Em aberto: 2 consultas = R$ 380,00");
    console.log("- Em atraso: 2 consultas = R$ 300,00");
  } catch (error) {
    console.error("❌ Erro ao inserir dados:", error);
  } finally {
    await client.end();
  }
}

seedTestData();
