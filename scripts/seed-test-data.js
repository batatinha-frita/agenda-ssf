const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const {
  clinicsTable,
  doctorsTable,
  patientsTable,
  appointmentsTable,
} = require("../src/db/schema");

// Configuração do banco
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL não encontrada no arquivo .env");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

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

const appointmentStatuses = ["confirmed", "pending", "cancelled", "completed"];
const paymentStatuses = ["paid", "pending", "overdue"];

// Funções auxiliares
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
  // Gera CPF válido mas fictício
  const randomDigits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10),
  );
  const cpf = randomDigits.join("");

  // Calcula dígitos verificadores (simplificado para teste)
  const d1 = Math.floor(Math.random() * 10);
  const d2 = Math.floor(Math.random() * 10);

  return `${cpf}${d1}${d2}`;
}

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function getRandomTime() {
  const hours = Math.floor(Math.random() * 10) + 8; // 8h às 17h
  const minutes = Math.random() < 0.5 ? 0 : 30;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
}

function getRandomPrice() {
  const prices = [15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000]; // Valores em centavos
  return getRandomElement(prices);
}

async function seedData() {
  try {
    console.log("🚀 Iniciando inserção de dados de teste...\n");

    // 1. Buscar clínica existente
    console.log("📋 Buscando clínica...");
    const clinics = await db.select().from(clinicsTable).limit(1);

    if (clinics.length === 0) {
      console.error(
        "❌ Nenhuma clínica encontrada. Crie uma clínica primeiro.",
      );
      return;
    }

    const clinicId = clinics[0].id;
    console.log(`✅ Clínica encontrada: ${clinics[0].name}`);

    // 2. Criar 15 médicos
    console.log("\n👨‍⚕️ Criando médicos...");
    const doctors = [];

    for (let i = 0; i < 15; i++) {
      const doctorData = {
        clinicId,
        name: `Dr. ${getRandomName()}`,
        specialty: getRandomElement(specialties),
        availableFromWeekDay: 1, // Segunda
        availableToWeekDay: 5, // Sexta
        availableFromTime: "08:00:00",
        availableToTime: "18:00:00",
        appointmentPriceInCents: getRandomPrice(),
      };

      const [doctor] = await db
        .insert(doctorsTable)
        .values(doctorData)
        .returning();
      doctors.push(doctor);
      console.log(`✅ Médico criado: ${doctor.name} - ${doctor.specialty}`);
    }

    // 3. Criar 30 pacientes
    console.log("\n👥 Criando pacientes...");
    const patients = [];

    for (let i = 0; i < 30; i++) {
      const name = getRandomName();
      const patientData = {
        clinicId,
        name,
        email: getRandomEmail(name),
        phoneNumber: getRandomPhone(),
        sex: Math.random() < 0.5 ? "male" : "female",
        cpf: getRandomCPF(),
        birthDate: getRandomDate(new Date(1950, 0, 1), new Date(2005, 11, 31)),
        cep: `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`,
        logradouro: `Rua ${getRandomElement(["das Flores", "do Sol", "da Paz", "Central", "Principal"])}`,
        numero: Math.floor(Math.random() * 9999) + 1,
        emergencyContact: getRandomName(),
        emergencyPhone: getRandomPhone(),
      };

      const [patient] = await db
        .insert(patientsTable)
        .values(patientData)
        .returning();
      patients.push(patient);
      console.log(`✅ Paciente criado: ${patient.name}`);
    }

    // 4. Criar 120 consultas distribuídas nos últimos 60 dias e próximos 30 dias
    console.log("\n📅 Criando consultas...");
    const appointments = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60); // 60 dias atrás
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 dias à frente

    for (let i = 0; i < 120; i++) {
      const doctor = getRandomElement(doctors);
      const patient = getRandomElement(patients);
      const appointmentDate = getRandomDate(startDate, endDate);

      // Definir status baseado na data
      let status = "confirmed";
      let paymentStatus = "pending";

      const now = new Date();
      if (appointmentDate < now) {
        // Consulta no passado
        const rand = Math.random();
        if (rand < 0.15) {
          status = "cancelled";
          paymentStatus = "pending";
        } else {
          status = "completed";
          paymentStatus =
            Math.random() < 0.8
              ? "paid"
              : Math.random() < 0.7
                ? "pending"
                : "overdue";
        }
      } else {
        // Consulta no futuro
        status = Math.random() < 0.9 ? "confirmed" : "pending";
        paymentStatus = "pending";
      }

      const appointmentData = {
        clinicId,
        doctorId: doctor.id,
        patientId: patient.id,
        date: appointmentDate,
        appointmentPriceInCents: doctor.appointmentPriceInCents,
        appointmentStatus: status,
        paymentStatus,
        notes: Math.random() < 0.3 ? `Observações da consulta ${i + 1}` : null,
      };

      const [appointment] = await db
        .insert(appointmentsTable)
        .values(appointmentData)
        .returning();
      appointments.push(appointment);

      if ((i + 1) % 20 === 0) {
        console.log(`✅ ${i + 1} consultas criadas...`);
      }
    }

    console.log("\n🎉 DADOS DE TESTE CRIADOS COM SUCESSO!");
    console.log("📊 Resumo:");
    console.log(`   • ${doctors.length} médicos`);
    console.log(`   • ${patients.length} pacientes`);
    console.log(`   • ${appointments.length} consultas`);
    console.log("\n🚀 O sistema agora tem dados robustos para testes!");
  } catch (error) {
    console.error("❌ Erro ao criar dados de teste:", error);
  } finally {
    await client.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
