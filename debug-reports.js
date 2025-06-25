const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const {
  appointmentsTable,
  patientsTable,
  doctorsTable,
  clinicsTable,
} = require("./src/db/schema.ts");

async function debugReports() {
  try {
    // Verificar se as variáveis de ambiente existem
    console.log("DATABASE_URL existe:", !!process.env.DATABASE_URL);

    if (!process.env.DATABASE_URL) {
      console.log("DATABASE_URL não definida. Verificando arquivo .env...");
      require("dotenv").config();
      console.log("DATABASE_URL após dotenv:", !!process.env.DATABASE_URL);
    }

    if (!process.env.DATABASE_URL) {
      console.log("Erro: DATABASE_URL não encontrada");
      return;
    }

    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);

    console.log("\n=== DEBUG RELATÓRIOS ===\n");

    // 1. Verificar clínicas
    console.log("1. Verificando clínicas...");
    const clinics = await db.select().from(clinicsTable);
    console.log("Total de clínicas:", clinics.length);
    if (clinics.length > 0) {
      console.log("Primeira clínica:", clinics[0]);
    }

    if (clinics.length === 0) {
      console.log("❌ Nenhuma clínica encontrada!");
      return;
    }

    // 2. Verificar pacientes
    console.log("\n2. Verificando pacientes...");
    const patients = await db.select().from(patientsTable);
    console.log("Total de pacientes:", patients.length);
    if (patients.length > 0) {
      console.log("Primeiros 3 pacientes:");
      patients.slice(0, 3).forEach((p, i) => {
        console.log(
          `  ${i + 1}. ${p.name} (${p.sex}) - Clínica: ${p.clinicId}`,
        );
      });
    }

    // 3. Verificar médicos
    console.log("\n3. Verificando médicos...");
    const doctors = await db.select().from(doctorsTable);
    console.log("Total de médicos:", doctors.length);
    if (doctors.length > 0) {
      console.log("Primeiros 3 médicos:");
      doctors.slice(0, 3).forEach((d, i) => {
        console.log(
          `  ${i + 1}. ${d.name} (${d.specialty}) - Clínica: ${d.clinicId}`,
        );
      });
    }

    // 4. Verificar consultas
    console.log("\n4. Verificando consultas...");
    const appointments = await db.select().from(appointmentsTable);
    console.log("Total de consultas:", appointments.length);
    if (appointments.length > 0) {
      console.log("Primeiras 5 consultas:");
      appointments.slice(0, 5).forEach((a, i) => {
        console.log(
          `  ${i + 1}. ${a.date} - Status: ${a.appointmentStatus} - Clínica: ${a.clinicId}`,
        );
      });

      // Verificar distribuição por status
      const statusCount = {};
      appointments.forEach((a) => {
        statusCount[a.appointmentStatus] =
          (statusCount[a.appointmentStatus] || 0) + 1;
      });
      console.log("\nDistribuição por status:", statusCount);

      // Verificar distribuição por gênero dos pacientes
      const patientIds = [...new Set(appointments.map((a) => a.patientId))];
      console.log("Pacientes únicos em consultas:", patientIds.length);

      if (patientIds.length > 0 && patients.length > 0) {
        const appointmentPatients = patients.filter((p) =>
          patientIds.includes(p.id),
        );
        const genderCount = {
          male: appointmentPatients.filter((p) => p.sex === "male").length,
          female: appointmentPatients.filter((p) => p.sex === "female").length,
        };
        console.log(
          "Distribuição por gênero (pacientes que fizeram consultas):",
          genderCount,
        );
      }
    } else {
      console.log("❌ Nenhuma consulta encontrada!");
    }

    await client.end();
    console.log("\n=== FIM DEBUG ===");
  } catch (error) {
    console.error("Erro no debug:", error);
  }
}

debugReports();
