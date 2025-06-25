require("dotenv").config();
const { Client } = require("pg");

// Dados para geração aleatória
const firstNames = [
  "Ana",
  "João",
  "Maria",
  "Pedro",
  "Carla",
  "Lucas",
  "Fernanda",
  "Rafael",
  "Juliana",
  "Bruno",
  "Amanda",
  "Thiago",
  "Larissa",
  "Gabriel",
  "Camila",
  "Felipe",
  "Beatriz",
  "Diego",
  "Natália",
  "Rodrigo",
  "Patrícia",
  "Marcelo",
  "Vanessa",
  "André",
  "Priscila",
  "Leonardo",
  "Renata",
  "Eduardo",
  "Cristina",
  "Guilherme",
  "Mônica",
  "Fábio",
  "Simone",
  "Carlos",
  "Débora",
  "Ricardo",
  "Tatiana",
  "Roberto",
  "Luciana",
  "Daniel",
];

const lastNames = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Rodrigues",
  "Ferreira",
  "Alves",
  "Pereira",
  "Lima",
  "Gomes",
  "Costa",
  "Ribeiro",
  "Martins",
  "Carvalho",
  "Almeida",
  "Lopes",
  "Soares",
  "Fernandes",
  "Vieira",
  "Barbosa",
  "Rocha",
  "Dias",
  "Monteiro",
  "Cardoso",
  "Reis",
  "Araújo",
  "Castro",
  "Andrade",
  "Nascimento",
  "Moreira",
];

const specialties = [
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Ginecologia",
  "Neurologia",
  "Ortopedia",
  "Pediatria",
  "Psiquiatria",
  "Urologia",
  "Oftalmologia",
  "Otorrinolaringologia",
  "Angiologia",
  "Reumatologia",
  "Pneumologia",
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomName() {
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
}

function getRandomEmail(name) {
  const cleanName = name
    .toLowerCase()
    .replace(/\s+/g, ".")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const domains = [
    "gmail.com",
    "hotmail.com",
    "yahoo.com.br",
    "outlook.com",
    "uol.com.br",
  ];
  return `${cleanName}@${getRandomElement(domains)}`;
}

function getRandomPhone() {
  const area = ["11", "21", "31", "41", "51", "61", "71", "81", "85", "47"];
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return `(${getRandomElement(area)}) 9${number}`;
}

function getRandomCPF() {
  const randomDigits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10),
  );
  const cpf = randomDigits.join("");
  const d1 = Math.floor(Math.random() * 10);
  const d2 = Math.floor(Math.random() * 10);
  return `${cpf}${d1}${d2}`;
}

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function getRandomPrice() {
  const prices = [15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000];
  return getRandomElement(prices);
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function seedData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("🚀 Conectado ao banco de dados\n");

    // 1. Buscar clínica existente
    console.log("📋 Buscando clínica...");
    const clinicResult = await client.query(
      "SELECT id, name FROM clinics LIMIT 1",
    );

    if (clinicResult.rows.length === 0) {
      console.error(
        "❌ Nenhuma clínica encontrada. Crie uma clínica primeiro.",
      );
      return;
    }

    const clinicId = clinicResult.rows[0].id;
    console.log(`✅ Clínica encontrada: ${clinicResult.rows[0].name}`);

    // 2. Criar 15 médicos
    console.log("\n👨‍⚕️ Criando médicos...");
    const doctorIds = [];

    for (let i = 0; i < 15; i++) {
      const doctorId = generateUUID();
      const name = `Dr. ${getRandomName()}`;
      const specialty = getRandomElement(specialties);
      const price = getRandomPrice();

      await client.query(
        `
        INSERT INTO doctors (
          id, clinic_id, name, specialty, 
          available_from_week_day, available_to_week_day,
          available_from_time, available_to_time,
          appointment_price_in_cents, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )
      `,
        [
          doctorId,
          clinicId,
          name,
          specialty,
          1,
          5,
          "08:00:00",
          "18:00:00",
          price,
        ],
      );

      doctorIds.push({ id: doctorId, price });
      console.log(`✅ ${name} - ${specialty}`);
    }

    // 3. Criar 30 pacientes
    console.log("\n👥 Criando pacientes...");
    const patientIds = [];

    for (let i = 0; i < 30; i++) {
      const patientId = generateUUID();
      const name = getRandomName();
      const email = getRandomEmail(name);
      const phone = getRandomPhone();
      const sex = Math.random() < 0.5 ? "male" : "female";
      const cpf = getRandomCPF();
      const birthDate = getRandomDate(
        new Date(1950, 0, 1),
        new Date(2005, 11, 31),
      );
      const cep = `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`;
      const logradouro = `Rua ${getRandomElement(["das Flores", "do Sol", "da Paz", "Central", "Principal"])}`;
      const numero = `${Math.floor(Math.random() * 9999) + 1}`;
      const emergencyContact = getRandomName();
      const emergencyPhone = getRandomPhone();

      await client.query(
        `
        INSERT INTO patients (
          id, clinic_id, name, email, phone_number, sex, cpf, birth_date,
          cep, logradouro, numero, emergency_contact, emergency_phone,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        )
      `,
        [
          patientId,
          clinicId,
          name,
          email,
          phone,
          sex,
          cpf,
          birthDate,
          cep,
          logradouro,
          numero,
          emergencyContact,
          emergencyPhone,
        ],
      );

      patientIds.push(patientId);
      console.log(`✅ ${name}`);
    }

    // 4. Criar 120 consultas
    console.log("\n📅 Criando consultas...");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60); // 60 dias atrás
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 dias à frente

    for (let i = 0; i < 120; i++) {
      const appointmentId = generateUUID();
      const doctor = getRandomElement(doctorIds);
      const patientId = getRandomElement(patientIds);
      const appointmentDate = getRandomDate(startDate, endDate);

      // Definir status baseado na data
      let appointmentStatus = "confirmed";
      let paymentStatus = "pending";

      const now = new Date();
      if (appointmentDate < now) {
        // Consulta no passado
        const rand = Math.random();
        if (rand < 0.15) {
          appointmentStatus = "cancelled";
          paymentStatus = "pending";
        } else {
          appointmentStatus = "completed";
          paymentStatus =
            Math.random() < 0.8
              ? "paid"
              : Math.random() < 0.7
                ? "pending"
                : "overdue";
        }
      } else {
        // Consulta no futuro
        appointmentStatus = Math.random() < 0.9 ? "confirmed" : "pending";
        paymentStatus = "pending";
      }

      const notes =
        Math.random() < 0.3 ? `Observações da consulta ${i + 1}` : null;

      await client.query(
        `
        INSERT INTO appointments (
          id, clinic_id, doctor_id, patient_id, date,
          appointment_price_in_cents, appointment_status, payment_status,
          notes, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )
      `,
        [
          appointmentId,
          clinicId,
          doctor.id,
          patientId,
          appointmentDate,
          doctor.price,
          appointmentStatus,
          paymentStatus,
          notes,
        ],
      );

      if ((i + 1) % 30 === 0) {
        console.log(`✅ ${i + 1} consultas criadas...`);
      }
    }

    console.log("\n🎉 DADOS DE TESTE CRIADOS COM SUCESSO!");
    console.log("📊 Resumo:");
    console.log(`   • 15 médicos adicionados`);
    console.log(`   • 30 pacientes adicionados`);
    console.log(`   • 120 consultas adicionadas`);
    console.log(
      "\n🚀 O sistema agora tem dados robustos para testar os relatórios!",
    );
  } catch (error) {
    console.error("❌ Erro ao criar dados de teste:", error);
  } finally {
    await client.end();
  }
}

seedData();
