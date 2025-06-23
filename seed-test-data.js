require("dotenv").config();

const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const dayjs = require("dayjs");

// Importar as tabelas diretamente (sem TypeScript)
const { sql } = require("drizzle-orm");

async function seedTestData() {
  // Conectar ao banco
  const client = postgres(process.env.DATABASE_URL);

  try {
    console.log("Inserindo dados de teste...");

    // Inserir clínica de teste
    await client`
      INSERT INTO clinics (id, name, created_at, updated_at) 
      VALUES (gen_random_uuid(), 'Clínica de Testes', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;

    console.log("Clínica criada");

    // Buscar a clínica criada
    const clinics = await client`
      SELECT id FROM clinics WHERE name = 'Clínica de Testes' LIMIT 1
    `;
    const clinicId = clinics[0].id;

    // Inserir médico de teste
    await client`
      INSERT INTO doctors (id, clinic_id, name, specialty, appointment_price_in_cents, 
                          available_from_week_day, available_to_week_day, 
                          available_from_time, available_to_time, created_at, updated_at)
      VALUES (gen_random_uuid(), ${clinicId}, 'Dr. João Silva', 'Cardiologia', 15000,
              1, 5, '08:00', '18:00', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;

    console.log("Médico criado");

    // Buscar o médico criado
    const doctors = await client`
      SELECT id FROM doctors WHERE clinic_id = ${clinicId} LIMIT 1
    `;
    const doctorId = doctors[0].id;

    // Inserir pacientes de teste
    await client`
      INSERT INTO patients (id, clinic_id, name, email, phone_number, sex, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), ${clinicId}, 'Maria Santos', 'maria@email.com', '(11) 99999-1111', 'female', NOW(), NOW()),
        (gen_random_uuid(), ${clinicId}, 'João Silva', 'joao@email.com', '(11) 99999-2222', 'male', NOW(), NOW()),
        (gen_random_uuid(), ${clinicId}, 'Ana Costa', 'ana@email.com', '(11) 99999-3333', 'female', NOW(), NOW()),
        (gen_random_uuid(), ${clinicId}, 'Pedro Oliveira', 'pedro@email.com', '(11) 99999-4444', 'male', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;

    console.log("Pacientes criados");

    // Buscar os pacientes criados
    const patients = await client`
      SELECT id FROM patients WHERE clinic_id = ${clinicId} ORDER BY created_at
    `;

    // Inserir consultas de teste
    const today = dayjs();

    // Consultas pagas (passadas)
    await client`
      INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, date, appointment_price_in_cents, payment_status, appointment_status, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), ${clinicId}, ${doctorId}, ${patients[0].id}, 
         ${today.subtract(10, "days").toDate()}, 15000, 'paid', 'completed', NOW(), NOW()),
        (gen_random_uuid(), ${clinicId}, ${doctorId}, ${patients[1].id}, 
         ${today.subtract(5, "days").toDate()}, 15000, 'paid', 'completed', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;

    // Consultas em aberto (futuras)
    await client`
      INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, date, appointment_price_in_cents, payment_status, appointment_status, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), ${clinicId}, ${doctorId}, ${patients[2].id}, 
         ${today.add(3, "days").toDate()}, 20000, 'pending', 'confirmed', NOW(), NOW()),
        (gen_random_uuid(), ${clinicId}, ${doctorId}, ${patients[3].id}, 
         ${today.add(7, "days").toDate()}, 18000, 'pending', 'confirmed', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;

    // Consultas em atraso
    await client`
      INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, date, appointment_price_in_cents, payment_status, appointment_status, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), ${clinicId}, ${doctorId}, ${patients[0].id}, 
         ${today.subtract(15, "days").toDate()}, 15000, 'pending', 'completed', NOW(), NOW()),
        (gen_random_uuid(), ${clinicId}, ${doctorId}, ${patients[1].id}, 
         ${today.subtract(20, "days").toDate()}, 15000, 'overdue', 'completed', NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;

    console.log("Consultas criadas");

    // Verificar os dados
    const counts = await client`
      SELECT 
        'Consultas' as tabela, 
        COUNT(*) as total,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as pagos,
        SUM(CASE WHEN payment_status = 'pending' AND date > CURRENT_DATE THEN 1 ELSE 0 END) as em_aberto,
        SUM(CASE WHEN payment_status = 'overdue' OR (payment_status = 'pending' AND date < CURRENT_DATE) THEN 1 ELSE 0 END) as em_atraso
      FROM appointments 
      WHERE clinic_id = ${clinicId}
    `;

    console.log("Dados de teste inseridos com sucesso!");
    console.log("Resumo:", counts[0]);
  } catch (error) {
    console.error("Erro ao inserir dados:", error);
  } finally {
    await client.end();
  }
}

seedTestData();
