const { drizzle } = require("drizzle-orm/node-postgres");
const { eq, and, gte, lte } = require("drizzle-orm");
const { Pool } = require("pg");

// Verificar se existem appointments na base de dados
async function debugAppointments() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("❌ DATABASE_URL não encontrado no .env");
    return;
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  try {
    console.log("🔍 Verificando appointments na base de dados...");
    // Query direta para verificar appointments
    const result = await pool.query(`
      SELECT 
        a.id,
        a.clinic_id,
        a.date,
        a.payment_status,
        a.appointment_price_in_cents,
        p.name as patient_name,
        d.name as doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LIMIT 10
    `);

    console.log(`📊 Total de appointments encontrados: ${result.rows.length}`);

    if (result.rows.length > 0) {
      console.log("📋 Appointments encontrados:");
      result.rows.forEach((app, index) => {
        console.log(`${index + 1}. ID: ${app.id}`);
        console.log(`   Clinic ID: ${app.clinic_id}`);
        console.log(`   Paciente: ${app.patient_name}`);
        console.log(`   Médico: ${app.doctor_name}`);
        console.log(`   Data: ${app.date}`);
        console.log(`   Status: ${app.payment_status}`);
        console.log(`   Valor: ${app.appointment_price_in_cents} centavos`);
        console.log("   ---");
      });
    } else {
      console.log("❌ Nenhum appointment encontrado na base de dados");

      // Verificar se as tabelas existem
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('appointments', 'patients', 'doctors')
      `);

      console.log(
        "� Tabelas encontradas:",
        tablesResult.rows.map((r) => r.table_name),
      );
    }
  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error.message);
  } finally {
    await pool.end();
  }
}

debugAppointments();
