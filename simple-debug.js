// Simple debug script
const postgres = require("postgres");

async function simpleDebug() {
  try {
    // Check if we're in dev mode
    require("dotenv").config({ path: ".env.local" });

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.log("❌ DATABASE_URL não encontrada");
      console.log("Verificando variáveis de ambiente disponíveis...");
      console.log("NODE_ENV:", process.env.NODE_ENV);
      console.log(
        "Variáveis que começam com DB:",
        Object.keys(process.env).filter((k) => k.toLowerCase().includes("db")),
      );
      return;
    }

    console.log("✅ DATABASE_URL encontrada");

    const sql = postgres(databaseUrl);

    // Test basic connection
    const result = await sql`SELECT 1 as test`;
    console.log("✅ Conexão com banco funcionando");

    // Check tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    console.log("\nTabelas disponíveis:");
    tables.forEach((t) => console.log(`  - ${t.table_name}`));

    // Check if main tables exist
    const mainTables = ["clinics", "patients", "doctors", "appointments"];
    const existingTables = tables.map((t) => t.table_name);

    console.log("\nVerificando tabelas principais:");
    mainTables.forEach((table) => {
      const exists = existingTables.includes(table);
      console.log(`  ${exists ? "✅" : "❌"} ${table}`);
    });

    // If appointments table exists, check data
    if (existingTables.includes("appointments")) {
      const appointmentCount =
        await sql`SELECT COUNT(*) as count FROM appointments`;
      console.log(`\nTotal de appointments: ${appointmentCount[0].count}`);

      if (appointmentCount[0].count > 0) {
        const sampleAppointments = await sql`
          SELECT 
            appointment_status,
            COUNT(*) as count
          FROM appointments 
          GROUP BY appointment_status
        `;

        console.log("\nDistribuição por status:");
        sampleAppointments.forEach((s) => {
          console.log(`  ${s.appointment_status}: ${s.count}`);
        });
      }
    }

    // Check patients
    if (existingTables.includes("patients")) {
      const patientCount = await sql`SELECT COUNT(*) as count FROM patients`;
      console.log(`\nTotal de pacientes: ${patientCount[0].count}`);

      if (patientCount[0].count > 0) {
        const genderDistribution = await sql`
          SELECT 
            sex,
            COUNT(*) as count
          FROM patients 
          GROUP BY sex
        `;

        console.log("\nDistribuição por gênero:");
        genderDistribution.forEach((g) => {
          console.log(`  ${g.sex}: ${g.count}`);
        });
      }
    }

    await sql.end();
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

simpleDebug();
