require("dotenv").config();
const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const {
  clinicsTable,
  doctorsTable,
  patientsTable,
  appointmentsTable,
} = require("../src/db/schema.ts");
const { eq, and, between, not, inArray } = require("drizzle-orm");

// Configuração do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Dados para geração de pacientes
const firstNames = [
  "Ana",
  "Bruno",
  "Carlos",
  "Diana",
  "Eduardo",
  "Fernanda",
  "Gabriel",
  "Helena",
  "Igor",
  "Juliana",
  "Lucas",
  "Marina",
  "Nicolas",
  "Olivia",
  "Pedro",
  "Quitéria",
  "Rafael",
  "Sofia",
  "Thiago",
  "Ursula",
  "Vitor",
  "Wesley",
  "Ximena",
  "Yara",
  "Zeca",
  "Adriana",
  "Bernardo",
  "Camila",
  "Danilo",
  "Elisa",
  "Fabio",
  "Giovana",
  "Henrique",
  "Isabela",
  "João",
  "Kelly",
  "Leonardo",
  "Mariana",
  "Nathan",
  "Paula",
  "Ricardo",
  "Sabrina",
  "Tiago",
  "Vanessa",
  "Wagner",
  "Alice",
  "Beatriz",
  "Caio",
  "Débora",
  "Enzo",
  "Flávia",
  "Guilherme",
  "Heloísa",
  "Ivan",
  "Jéssica",
  "Kauã",
  "Larissa",
  "Mateus",
  "Natália",
  "Otávio",
  "Priscila",
  "Quintino",
  "Roberta",
  "Samuel",
  "Tatiana",
  "Ulisses",
  "Vitória",
  "William",
  "Ximena",
  "Yasmin",
  "Zuleika",
  "André",
  "Bianca",
  "Cláudio",
  "Daniela",
  "Everton",
  "Franciele",
  "Gustavo",
  "Ingrid",
  "Joaquim",
  "Katarina",
  "Luan",
  "Michelle",
  "Nelson",
  "Olívia",
  "Patrick",
  "Raquel",
  "Sérgio",
  "Talita",
  "Ulysses",
  "Viviane",
  "Walter",
  "Aline",
  "Breno",
  "Cintia",
  "Douglas",
  "Elaine",
  "Felipe",
  "Gisele",
  "Hugo",
  "Isis",
  "Jorge",
  "Karine",
  "Leandro",
  "Mônica",
  "Natan",
  "Paloma",
  "Ronaldo",
  "Simone",
  "Tales",
  "Úrsula",
  "Vinicius",
  "Wanda",
  "Alexandre",
  "Bárbara",
  "César",
  "Diane",
  "Edson",
  "Fátima",
  "Gerson",
  "Haroldo",
  "Iara",
  "Jaime",
  "Karla",
  "Luiz",
  "Magda",
  "Nilton",
  "Patrícia",
  "Roberto",
  "Silvia",
  "Tadeu",
  "Valdirene",
  "Washington",
  "Amanda",
  "Bento",
  "Carla",
  "Davi",
  "Elizabete",
  "Fernando",
  "Graziela",
  "Hélio",
  "Irene",
  "Jairo",
  "Kátia",
  "Luís",
  "Marta",
  "Nilson",
  "Poliana",
  "Rodrigo",
  "Soraia",
  "Teodoro",
  "Valdete",
  "Wilson",
  "Andréa",
  "Benedito",
  "Célia",
  "Diego",
  "Elza",
  "Flávio",
  "Gilda",
  "Humberto",
  "Iolanda",
  "Jair",
  "Kellen",
  "Laércio",
  "Márcia",
  "Noemia",
  "Pietra",
  "Rubens",
  "Solange",
  "Tarcísio",
  "Valéria",
  "Waldir",
  "Angélica",
  "Benedita",
  "Célio",
  "Djalma",
  "Edna",
  "Francisco",
  "Gladis",
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
  "Mendes",
  "Ramos",
  "Moreira",
  "Reis",
  "Freitas",
  "Morais",
  "Pinto",
  "Cardoso",
  "Farias",
  "Castro",
  "Nascimento",
  "Correia",
  "Araújo",
  "Campos",
  "Teixeira",
  "Moura",
  "Cavalcante",
  "Nunes",
  "Fonseca",
  "Andrade",
  "Machado",
  "Medeiros",
  "Cunha",
  "Melo",
  "Torres",
  "Santana",
  "Gonçalves",
  "Barros",
  "Matos",
  "Porto",
  "Azevedo",
  "Vasconcelos",
  "Nogueira",
  "Rezende",
  "Batista",
  "Duarte",
  "Coelho",
  "Borges",
  "Bezerra",
  "Mendonça",
  "Tavares",
  "Guimarães",
  "Carneiro",
  "Amorim",
  "Macedo",
  "Paiva",
  "Magalhães",
];

const cities = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Salvador",
  "Brasília",
  "Curitiba",
  "Recife",
  "Porto Alegre",
  "Manaus",
  "Belém",
  "Goiânia",
  "Guarulhos",
  "Campinas",
  "São Luís",
  "Maceió",
  "Duque de Caxias",
  "Natal",
  "Teresina",
  "São Bernardo do Campo",
  "Nova Iguaçu",
  "João Pessoa",
  "Santo André",
  "Osasco",
  "Jaboatão dos Guararapes",
  "São José dos Campos",
  "Ribeirão Preto",
  "Uberlândia",
  "Sorocaba",
  "Contagem",
  "Aracaju",
  "Feira de Santana",
  "Cuiabá",
  "Joinville",
  "Juiz de Fora",
  "Londrina",
  "Aparecida de Goiânia",
];

const streets = [
  "Rua das Flores",
  "Avenida Paulista",
  "Rua Augusta",
  "Rua do Comércio",
  "Avenida Brasil",
  "Rua Principal",
  "Rua São João",
  "Avenida Independência",
  "Rua da Paz",
  "Avenida Central",
  "Rua Quinze de Novembro",
  "Rua Sete de Setembro",
  "Avenida Getúlio Vargas",
  "Rua Dom Pedro II",
  "Avenida JK",
  "Rua Tiradentes",
  "Avenida Presidente Vargas",
  "Rua Marechal Deodoro",
  "Rua Barão do Rio Branco",
  "Avenida Atlântica",
  "Rua das Palmeiras",
  "Avenida das Américas",
  "Rua José Bonifácio",
  "Rua Floriano Peixoto",
  "Avenida Copacabana",
];

// Função para gerar dados aleatórios
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomName() {
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
}

function generateRandomEmail(name) {
  const cleanName = name.toLowerCase().replace(/\s+/g, ".");
  const domains = [
    "gmail.com",
    "hotmail.com",
    "yahoo.com",
    "outlook.com",
    "uol.com.br",
  ];
  return `${cleanName}${Math.floor(Math.random() * 1000)}@${getRandomElement(domains)}`;
}

function generateRandomPhone() {
  const ddd = Math.floor(Math.random() * 89) + 11; // DDDs de 11 a 99
  const number = Math.floor(Math.random() * 900000000) + 100000000; // 9 dígitos
  return `(${ddd}) ${number.toString().substring(0, 5)}-${number.toString().substring(5)}`;
}

function generateRandomCPF() {
  const randomDigits = () => Math.floor(Math.random() * 10);
  const cpf = Array.from({ length: 9 }, randomDigits);

  // Calcular dígitos verificadores (simplificado)
  const d1 =
    ((cpf.reduce((acc, digit, index) => acc + digit * (10 - index), 0) * 10) %
      11) %
    10;
  const d2 =
    (([...cpf, d1].reduce(
      (acc, digit, index) => acc + digit * (11 - index),
      0,
    ) *
      10) %
      11) %
    10;

  return `${cpf.join("")}${d1}${d2}`.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4",
  );
}

function generateRandomCEP() {
  return `${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}`;
}

function generateRandomBirthDate() {
  const start = new Date(1950, 0, 1);
  const end = new Date(2010, 11, 31);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

// Função para verificar se horário está disponível
function isTimeSlotAvailable(doctor, date, existingAppointments) {
  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.getDay();
  const hour = appointmentDate.getHours();
  const minute = appointmentDate.getMinutes();

  // Verificar se está no horário de trabalho do médico
  const [startHour, startMinute] = doctor.availableFromTime
    .split(":")
    .map(Number);
  const [endHour, endMinute] = doctor.availableToTime.split(":").map(Number);

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  const appointmentTime = hour * 60 + minute;

  // Verificar dia da semana
  if (
    dayOfWeek < doctor.availableFromWeekDay ||
    dayOfWeek > doctor.availableToWeekDay
  ) {
    return false;
  }

  // Verificar horário
  if (appointmentTime < startTime || appointmentTime >= endTime) {
    return false;
  }

  // Verificar conflito com outros agendamentos
  const sameTimeSlot = existingAppointments.find((apt) => {
    const aptDate = new Date(apt.date);
    return (
      aptDate.getTime() === appointmentDate.getTime() &&
      apt.doctorId === doctor.id
    );
  });

  return !sameTimeSlot;
}

// Função para gerar horário aleatório disponível
function generateRandomAvailableTime(doctor, date, existingAppointments) {
  const baseDate = new Date(date);
  const [startHour, startMinute] = doctor.availableFromTime
    .split(":")
    .map(Number);
  const [endHour, endMinute] = doctor.availableToTime.split(":").map(Number);

  // Gerar intervalos de 30 em 30 minutos
  const possibleTimes = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === endHour - 1 && minute >= endMinute) break;

      const testDate = new Date(baseDate);
      testDate.setHours(hour, minute, 0, 0);

      if (isTimeSlotAvailable(doctor, testDate, existingAppointments)) {
        possibleTimes.push(testDate);
      }
    }
  }

  return possibleTimes.length > 0 ? getRandomElement(possibleTimes) : null;
}

async function main() {
  try {
    console.log("🚀 Iniciando criação de dados massivos...");

    // Buscar clínica, médicos e pacientes existentes
    const clinics = await db.select().from(clinicsTable).limit(1);
    if (clinics.length === 0) {
      throw new Error("Nenhuma clínica encontrada!");
    }

    const clinic = clinics[0];
    console.log(`📋 Usando clínica: ${clinic.name}`);

    const doctors = await db
      .select()
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, clinic.id));
    console.log(`👨‍⚕️ Médicos encontrados: ${doctors.length}`);

    const existingPatients = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinic.id));
    console.log(`👥 Pacientes existentes: ${existingPatients.length}`);

    const existingAppointments = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.clinicId, clinic.id));
    console.log(`📅 Agendamentos existentes: ${existingAppointments.length}`);

    // Extrair emails e CPFs existentes para evitar duplicatas
    const existingEmails = new Set(existingPatients.map((p) => p.email));
    const existingCPFs = new Set(
      existingPatients.map((p) => p.cpf).filter(Boolean),
    );

    // Criar 188 novos pacientes
    console.log("\n👥 Criando 188 novos pacientes...");
    const newPatients = [];

    for (let i = 0; i < 188; i++) {
      let email, cpf;
      let attempts = 0;

      // Gerar email único
      do {
        const name = generateRandomName();
        email = generateRandomEmail(name);
        attempts++;
      } while (existingEmails.has(email) && attempts < 100);

      // Gerar CPF único
      attempts = 0;
      do {
        cpf = generateRandomCPF();
        attempts++;
      } while (existingCPFs.has(cpf) && attempts < 100);

      const name = generateRandomName();
      const patient = {
        clinicId: clinic.id,
        name,
        email,
        phoneNumber: generateRandomPhone(),
        sex: Math.random() > 0.5 ? "female" : "male",
        cpf,
        birthDate: generateRandomBirthDate(),
        cep: generateRandomCEP(),
        logradouro: getRandomElement(streets),
        numero: Math.floor(Math.random() * 9999) + 1,
        complemento:
          Math.random() > 0.7
            ? `Apto ${Math.floor(Math.random() * 500) + 1}`
            : null,
        emergencyContact: generateRandomName(),
        emergencyPhone: generateRandomPhone(),
        observations:
          Math.random() > 0.8 ? "Paciente com histórico de alergias" : null,
      };

      newPatients.push(patient);
      existingEmails.add(email);
      existingCPFs.add(cpf);

      if ((i + 1) % 50 === 0) {
        console.log(`   ✅ Criados ${i + 1}/188 pacientes`);
      }
    }

    // Inserir pacientes no banco
    console.log("💾 Inserindo pacientes no banco de dados...");
    const insertedPatients = await db
      .insert(patientsTable)
      .values(newPatients)
      .returning();
    console.log(
      `✅ ${insertedPatients.length} pacientes inseridos com sucesso!`,
    );

    // Combinar pacientes existentes e novos
    const allPatients = [...existingPatients, ...insertedPatients];

    // Criar 500 novos agendamentos
    console.log("\n📅 Criando 500 novos agendamentos...");
    const newAppointments = [];
    const appointmentStatuses = ["confirmed", "completed", "pending"];
    const paymentStatuses = ["paid", "pending", "overdue"];

    // Gerar datas dos últimos 60 dias até próximos 30 dias
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    let successfulAppointments = 0;
    let attempts = 0;
    const maxAttempts = 2000; // Limite de tentativas para evitar loop infinito

    while (successfulAppointments < 500 && attempts < maxAttempts) {
      attempts++;

      // Escolher médico aleatório
      const doctor = getRandomElement(doctors);

      // Gerar data aleatória dentro do período
      const randomDate = new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime()),
      );

      // Verificar se é um dia da semana válido para o médico
      const dayOfWeek = randomDate.getDay();
      if (
        dayOfWeek < doctor.availableFromWeekDay ||
        dayOfWeek > doctor.availableToWeekDay
      ) {
        continue;
      }

      // Gerar horário disponível
      const appointmentTime = generateRandomAvailableTime(doctor, randomDate, [
        ...existingAppointments,
        ...newAppointments,
      ]);

      if (!appointmentTime) {
        continue;
      }

      // Escolher paciente aleatório
      const patient = getRandomElement(allPatients);

      // Verificar se o paciente já tem agendamento no mesmo horário
      const patientConflict = [
        ...existingAppointments,
        ...newAppointments,
      ].find((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate.getTime() === appointmentTime.getTime() &&
          apt.patientId === patient.id
        );
      });

      if (patientConflict) {
        continue;
      }

      // Criar agendamento
      const appointment = {
        clinicId: clinic.id,
        patientId: patient.id,
        doctorId: doctor.id,
        date: appointmentTime,
        appointmentPriceInCents: doctor.appointmentPriceInCents,
        appointmentStatus: getRandomElement(appointmentStatuses),
        paymentStatus: getRandomElement(paymentStatuses),
        notes: Math.random() > 0.7 ? "Consulta de rotina" : null,
      };

      newAppointments.push(appointment);
      successfulAppointments++;

      if (successfulAppointments % 100 === 0) {
        console.log(`   ✅ Criados ${successfulAppointments}/500 agendamentos`);
      }
    }

    console.log(`📊 Total de tentativas: ${attempts}`);
    console.log(`✅ Agendamentos válidos criados: ${successfulAppointments}`);

    // Inserir agendamentos no banco
    if (newAppointments.length > 0) {
      console.log("💾 Inserindo agendamentos no banco de dados...");
      const insertedAppointments = await db
        .insert(appointmentsTable)
        .values(newAppointments)
        .returning();
      console.log(
        `✅ ${insertedAppointments.length} agendamentos inseridos com sucesso!`,
      );
    }

    // Resumo final
    console.log("\n🎉 RESUMO FINAL:");
    console.log(`👥 Pacientes adicionados: ${insertedPatients.length}`);
    console.log(`📅 Agendamentos adicionados: ${newAppointments.length}`);
    console.log(`📊 Total de pacientes: ${allPatients.length}`);
    console.log(
      `📊 Total de agendamentos: ${existingAppointments.length + newAppointments.length}`,
    );
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await pool.end();
  }
}

main();
