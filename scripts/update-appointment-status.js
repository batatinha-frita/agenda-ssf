const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { appointmentsTable } = require("../src/db/schema");
const { eq, or } = require("drizzle-orm");

// Carrega variáveis de ambiente
require("dotenv").config();

async function updateAppointmentStatus() {
  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    console.log("Iniciando atualização de status de agendamentos...");

    // Converte 'pending' e 'completed' para 'confirmed'
    const result = await db
      .update(appointmentsTable)
      .set({ appointmentStatus: "confirmed" })
      .where(
        or(
          eq(appointmentsTable.appointmentStatus, "pending"),
          eq(appointmentsTable.appointmentStatus, "completed"),
        ),
      );

    console.log(`Status atualizados: ${result.rowsAffected || 0} registros`);

    await client.end();
    console.log("Atualização concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    await client.end();
    process.exit(1);
  }
}

updateAppointmentStatus();
