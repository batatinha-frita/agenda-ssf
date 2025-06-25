import { db } from "../src/db/index.js";
import {
  clinicsTable,
  doctorsTable,
  patientsTable,
  appointmentsTable,
} from "../src/db/schema.js";
import { eq } from "drizzle-orm";

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

async function seedTestData() {
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

    // 2. Criar médicos
    console.log("\n👨‍⚕️ Criando médicos...");
    const doctors = [];

    for (let i = 0; i < 15; i++) {
      const doctorData = {
        clinicId,
        name: `Dr. ${getRandomName()}`,
        specialty: getRandomElement(specialties),
        availableFromWeekDay: 1,
        availableToWeekDay: 5,
        availableFromTime: "08:00:00",
        availableToTime: "18:00:00",
        appointmentPriceInCents: getRandomPrice(),
      };

      const [doctor] = await db
        .insert(doctorsTable)
        .values(doctorData)
        .returning();
      doctors.push(doctor);
      console.log(`✅ ${doctor.name} - ${doctor.specialty}`);
    }

    // 3. Criar pacientes
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
        numero: `${Math.floor(Math.random() * 9999) + 1}`,
        emergencyContact: getRandomName(),
        emergencyPhone: getRandomPhone(),
      };

      const [patient] = await db
        .insert(patientsTable)
        .values(patientData)
        .returning();
      patients.push(patient);
      console.log(`✅ ${patient.name}`);
    }

    // 4. Criar consultas
    console.log("\n📅 Criando consultas...");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    for (let i = 0; i < 120; i++) {
      const doctor = getRandomElement(doctors);
      const patient = getRandomElement(patients);
      const appointmentDate = getRandomDate(startDate, endDate);

      let status = "confirmed";
      let paymentStatus = "pending";

      const now = new Date();
      if (appointmentDate < now) {
        const rand = Math.random();
        if (rand < 0.15) {
          status = "cancelled";
        } else {
          status = "completed";
          paymentStatus =
            Math.random() < 0.8
              ? "paid"
              : Math.random() < 0.7
                ? "pending"
                : "overdue";
        }
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

      await db.insert(appointmentsTable).values(appointmentData);

      if ((i + 1) % 30 === 0) {
        console.log(`✅ ${i + 1} consultas criadas...`);
      }
    }

    console.log("\n🎉 DADOS DE TESTE CRIADOS!");
    console.log("📊 Resumo: 15 médicos, 30 pacientes, 120 consultas");
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

seedTestData();
