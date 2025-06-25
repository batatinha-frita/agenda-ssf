const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Função para gerar CPF válido
function generateCPF() {
  const numbers = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10),
  );

  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += numbers[i] * (10 - i);
  }
  const firstDigit = ((sum * 10) % 11) % 10;

  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += numbers[i] * (11 - i);
  }
  sum += firstDigit * 2;
  const secondDigit = ((sum * 10) % 11) % 10;

  return numbers
    .concat([firstDigit, secondDigit])
    .join("")
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// Função para gerar CEP válido
function generateCEP() {
  return (
    String(Math.floor(Math.random() * 100000)).padStart(5, "0") +
    "-" +
    String(Math.floor(Math.random() * 1000)).padStart(3, "0")
  );
}

// Nomes realistas brasileiros
const firstNames = [
  "Ana",
  "Maria",
  "José",
  "João",
  "Francisco",
  "Antônio",
  "Carlos",
  "Paulo",
  "Pedro",
  "Lucas",
  "Luiza",
  "Mariana",
  "Juliana",
  "Fernanda",
  "Camila",
  "Amanda",
  "Letícia",
  "Gabriela",
  "Beatriz",
  "Larissa",
  "Rafael",
  "Bruno",
  "Rodrigo",
  "Diego",
  "Felipe",
  "Gustavo",
  "Henrique",
  "Mateus",
  "Thiago",
  "André",
  "Isabella",
  "Sofia",
  "Manuela",
  "Alice",
  "Julia",
  "Laura",
  "Valentina",
  "Giovanna",
  "Maria Eduarda",
  "Helena",
  "Gabriel",
  "Arthur",
  "Enzo",
  "Lorenzo",
  "Théo",
  "Miguel",
  "Bernardo",
  "Heitor",
  "Davi",
  "Nicolas",
  "Sophia",
  "Yasmin",
  "Lara",
  "Lívia",
  "Melissa",
  "Nicole",
  "Pietra",
  "Cecília",
  "Eloá",
  "Antonella",
  "Samuel",
  "Benjamin",
  "Joaquim",
  "Lucca",
  "Caio",
  "Emanuel",
  "Vitor",
  "Isaac",
  "Daniel",
  "Leonardo",
  "Emanuelly",
  "Ana Clara",
  "Ana Júlia",
  "Maria Clara",
  "Vitória",
  "Stella",
  "Lorena",
  "Isabelly",
  "Catarina",
  "Luana",
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
  "Machado",
  "Mendes",
  "Freitas",
  "Cardoso",
  "Ramos",
  "Miranda",
  "Pinto",
  "Araújo",
  "Medeiros",
  "Cavalcanti",
  "Nascimento",
  "Moreira",
  "Correia",
  "Castro",
  "Andrade",
  "Campos",
  "Teixeira",
  "Reis",
  "Moura",
  "Nunes",
  "Sales",
  "Azevedo",
  "Cunha",
  "Melo",
  "Farias",
  "Peixoto",
  "Macedo",
];

const especialidades = [
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Ginecologia",
  "Neurologia",
  "Oftalmologia",
  "Ortopedia",
  "Otorrinolaringologia",
  "Pediatria",
  "Pneumologia",
  "Psiquiatria",
  "Radiologia",
  "Reumatologia",
  "Urologia",
  "Angiologia",
  "Cirurgia Geral",
  "Cirurgia Plástica",
  "Clínica Médica",
  "Hematologia",
  "Infectologia",
  "Medicina do Trabalho",
  "Medicina Esportiva",
  "Nefrologia",
  "Oncologia",
  "Patologia Clínica/Medicina Laboratorial",
  "Medicina de Família e Comunidade",
  "Geriatria",
  "Proctologia",
  "Medicina Nuclear",
];

const logradouros = [
  "Rua das Flores",
  "Avenida Brasil",
  "Rua São Paulo",
  "Avenida Atlântica",
  "Rua da Paz",
  "Rua do Comércio",
  "Avenida Central",
  "Rua Nova",
  "Avenida Paulista",
  "Rua das Palmeiras",
  "Rua 15 de Novembro",
  "Avenida Rio Branco",
  "Rua da Liberdade",
  "Rua José da Silva",
  "Avenida dos Estados",
  "Rua Santa Catarina",
  "Avenida Independência",
  "Rua Dom Pedro II",
  "Rua da República",
  "Avenida Getúlio Vargas",
];

// Status de consulta com distribuição mais realista
const appointmentStatuses = [
  { status: "completed", weight: 40 }, // 40% - maioria das consultas já realizadas
  { status: "confirmed", weight: 30 }, // 30% - consultas confirmadas
  { status: "pending", weight: 20 }, // 20% - consultas pendentes
  { status: "cancelled", weight: 10 }, // 10% - consultas canceladas
];

// Status de pagamento com distribuição realista
const paymentStatuses = [
  { status: "paid", weight: 50 }, // 50% - pagamentos realizados
  { status: "pending", weight: 35 }, // 35% - pagamentos pendentes
  { status: "overdue", weight: 15 }, // 15% - pagamentos em atraso
];

function getRandomWeightedStatus(statusArray) {
  const totalWeight = statusArray.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of statusArray) {
    if (random < item.weight) {
      return item.status;
    }
    random -= item.weight;
  }
  return statusArray[0].status;
}

function getRandomName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)];
  const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName1} ${lastName2}`;
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
    "terra.com.br",
  ];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const number = Math.floor(Math.random() * 999);
  return `${cleanName}${number > 100 ? number : ""}@${domain}`;
}

function getRandomPhone() {
  const ddd = ["11", "21", "31", "41", "51", "61", "71", "81", "85", "87"][
    Math.floor(Math.random() * 10)
  ];
  const number =
    "9" +
    Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0");
  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

function getRandomDate(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
}

function getRandomTime() {
  const hours = [8, 9, 10, 11, 14, 15, 16, 17]; // Horários comerciais
  const minutes = ["00", "30"];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = minutes[Math.floor(Math.random() * minutes.length)];
  return `${hour.toString().padStart(2, "0")}:${minute}:00`;
}

function getRandomPrice() {
  const prices = [15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000]; // Em centavos
  return prices[Math.floor(Math.random() * prices.length)];
}

async function generateData() {
  try {
    await client.connect();
    console.log("🔗 Conectado ao banco de dados");

    // Buscar clinic_id
    const clinicResult = await client.query("SELECT id FROM clinics LIMIT 1");
    if (clinicResult.rows.length === 0) {
      throw new Error("Nenhuma clínica encontrada");
    }
    const clinicId = clinicResult.rows[0].id;
    console.log("🏥 Usando clínica:", clinicId);

    // 1. GERAR 30 MÉDICOS ADICIONAIS (total será ~40)
    console.log("\n👨‍⚕️ Gerando médicos...");
    const doctorIds = [];
    for (let i = 0; i < 30; i++) {
      const name = getRandomName();
      const specialty =
        especialidades[Math.floor(Math.random() * especialidades.length)];
      const fromWeekDay = Math.floor(Math.random() * 3) + 1; // 1-3 (seg-qua)
      const toWeekDay = fromWeekDay + Math.floor(Math.random() * 3) + 1; // +1 a +4 dias
      const fromTime = `0${7 + Math.floor(Math.random() * 3)}:00:00`; // 07:00 - 09:00
      const toTime = `${16 + Math.floor(Math.random() * 3)}:00:00`; // 16:00 - 18:00
      const price = getRandomPrice();

      const result = await client.query(
        `
        INSERT INTO doctors (clinic_id, name, specialty, available_from_week_day, available_to_week_day, 
                           available_from_time, available_to_time, appointment_price_in_cents, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id
      `,
        [
          clinicId,
          name,
          specialty,
          fromWeekDay,
          toWeekDay,
          fromTime,
          toTime,
          price,
        ],
      );

      doctorIds.push(result.rows[0].id);
    }
    console.log(`✅ ${doctorIds.length} médicos criados`);

    // Buscar TODOS os médicos (incluindo os novos)
    const allDoctorsResult = await client.query(
      "SELECT id FROM doctors WHERE clinic_id = $1",
      [clinicId],
    );
    const allDoctorIds = allDoctorsResult.rows.map((row) => row.id);
    console.log(`📊 Total de médicos disponíveis: ${allDoctorIds.length}`);

    // 2. GERAR 90 PACIENTES ADICIONAIS (total será ~100)
    console.log("\n👥 Gerando pacientes...");
    const patientIds = [];
    for (let i = 0; i < 90; i++) {
      const name = getRandomName();
      const email = getRandomEmail(name);
      const phone = getRandomPhone();
      const sex = Math.random() > 0.5 ? "male" : "female";
      const cpf = generateCPF();
      const birthDate = getRandomDate(
        new Date(1950, 0, 1),
        new Date(2005, 11, 31),
      );
      const cep = generateCEP();
      const logradouro =
        logradouros[Math.floor(Math.random() * logradouros.length)];
      const numero = Math.floor(Math.random() * 9999) + 1;
      const complemento =
        Math.random() > 0.7
          ? `Apto ${Math.floor(Math.random() * 200) + 1}`
          : null;

      // Dados de emergência (70% dos pacientes terão)
      const hasEmergency = Math.random() > 0.3;
      const emergencyContact = hasEmergency ? getRandomName() : null;
      const emergencyPhone = hasEmergency ? getRandomPhone() : null;

      // Observações (30% dos pacientes terão)
      const observations =
        Math.random() > 0.7
          ? [
              "Alérgico a penicilina",
              "Diabético",
              "Hipertensão",
              "Toma anticoagulante",
              "Gestante",
            ][Math.floor(Math.random() * 5)]
          : null;

      try {
        const result = await client.query(
          `
          INSERT INTO patients (clinic_id, name, email, phone_number, sex, cpf, birth_date, cep, 
                              logradouro, numero, complemento, emergency_contact, emergency_phone, 
                              observations, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
          RETURNING id
        `,
          [
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
            complemento,
            emergencyContact,
            emergencyPhone,
            observations,
          ],
        );

        patientIds.push(result.rows[0].id);
      } catch (error) {
        if (error.code === "23505") {
          // CPF duplicado
          console.log(`⚠️ CPF duplicado para ${name}, gerando novo...`);
          i--; // Tentar novamente
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ ${patientIds.length} pacientes criados`);

    // Buscar TODOS os pacientes
    const allPatientsResult = await client.query(
      "SELECT id FROM patients WHERE clinic_id = $1",
      [clinicId],
    );
    const allPatientIds = allPatientsResult.rows.map((row) => row.id);
    console.log(`📊 Total de pacientes disponíveis: ${allPatientIds.length}`);

    // 3. GERAR 300 CONSULTAS (100 passadas, 100 presentes, 100 futuras)
    console.log("\n📅 Gerando consultas...");

    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const oneYearFromNow = new Date(today);
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    let totalAppointments = 0;

    // Consultas PASSADAS (100)
    console.log("  📈 Gerando consultas passadas...");
    for (let i = 0; i < 100; i++) {
      const patientId =
        allPatientIds[Math.floor(Math.random() * allPatientIds.length)];
      const doctorId =
        allDoctorIds[Math.floor(Math.random() * allDoctorIds.length)];

      // Data no passado (últimos 12 meses)
      const appointmentDate = getRandomDate(oneYearAgo, today);
      const appointmentTime = getRandomTime();
      const appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(
        parseInt(appointmentTime.split(":")[0]),
        parseInt(appointmentTime.split(":")[1]),
      );

      const price = getRandomPrice();

      // Para consultas passadas, maior chance de estar completed/paid
      const appointmentStatus = getRandomWeightedStatus([
        { status: "completed", weight: 70 },
        { status: "cancelled", weight: 20 },
        { status: "confirmed", weight: 10 },
      ]);

      const paymentStatus =
        appointmentStatus === "completed"
          ? getRandomWeightedStatus([
              { status: "paid", weight: 80 },
              { status: "pending", weight: 15 },
              { status: "overdue", weight: 5 },
            ])
          : getRandomWeightedStatus([
              { status: "pending", weight: 60 },
              { status: "overdue", weight: 30 },
              { status: "paid", weight: 10 },
            ]);

      const notes =
        Math.random() > 0.6
          ? [
              "Consulta de rotina",
              "Paciente apresentou melhora",
              "Solicitados exames complementares",
              "Retorno em 30 dias",
              "Tratamento respondendo bem",
            ][Math.floor(Math.random() * 5)]
          : null;

      await client.query(
        `
        INSERT INTO appointments (clinic_id, patient_id, doctor_id, date, appointment_price_in_cents,
                                payment_status, appointment_status, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `,
        [
          clinicId,
          patientId,
          doctorId,
          appointmentDateTime,
          price,
          paymentStatus,
          appointmentStatus,
          notes,
        ],
      );

      totalAppointments++;
    }

    // Consultas PRESENTES/PRÓXIMAS (100) - próximos 30 dias
    console.log("  📅 Gerando consultas presentes/próximas...");
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    for (let i = 0; i < 100; i++) {
      const patientId =
        allPatientIds[Math.floor(Math.random() * allPatientIds.length)];
      const doctorId =
        allDoctorIds[Math.floor(Math.random() * allDoctorIds.length)];

      const appointmentDate = getRandomDate(today, thirtyDaysFromNow);
      const appointmentTime = getRandomTime();
      const appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(
        parseInt(appointmentTime.split(":")[0]),
        parseInt(appointmentTime.split(":")[1]),
      );

      const price = getRandomPrice();

      // Para consultas próximas, maior chance de confirmed/pending
      const appointmentStatus = getRandomWeightedStatus([
        { status: "confirmed", weight: 60 },
        { status: "pending", weight: 30 },
        { status: "cancelled", weight: 10 },
      ]);

      const paymentStatus = getRandomWeightedStatus([
        { status: "pending", weight: 70 },
        { status: "paid", weight: 25 },
        { status: "overdue", weight: 5 },
      ]);

      await client.query(
        `
        INSERT INTO appointments (clinic_id, patient_id, doctor_id, date, appointment_price_in_cents,
                                payment_status, appointment_status, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW(), NOW())
      `,
        [
          clinicId,
          patientId,
          doctorId,
          appointmentDateTime,
          price,
          paymentStatus,
          appointmentStatus,
        ],
      );

      totalAppointments++;
    }

    // Consultas FUTURAS (100) - próximo ano
    console.log("  🔮 Gerando consultas futuras...");
    for (let i = 0; i < 100; i++) {
      const patientId =
        allPatientIds[Math.floor(Math.random() * allPatientIds.length)];
      const doctorId =
        allDoctorIds[Math.floor(Math.random() * allDoctorIds.length)];

      const appointmentDate = getRandomDate(thirtyDaysFromNow, oneYearFromNow);
      const appointmentTime = getRandomTime();
      const appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(
        parseInt(appointmentTime.split(":")[0]),
        parseInt(appointmentTime.split(":")[1]),
      );

      const price = getRandomPrice();

      // Para consultas futuras, maior chance de pending
      const appointmentStatus = getRandomWeightedStatus([
        { status: "pending", weight: 70 },
        { status: "confirmed", weight: 25 },
        { status: "cancelled", weight: 5 },
      ]);

      const paymentStatus = "pending"; // Consultas futuras geralmente são pending

      await client.query(
        `
        INSERT INTO appointments (clinic_id, patient_id, doctor_id, date, appointment_price_in_cents,
                                payment_status, appointment_status, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW(), NOW())
      `,
        [
          clinicId,
          patientId,
          doctorId,
          appointmentDateTime,
          price,
          paymentStatus,
          appointmentStatus,
        ],
      );

      totalAppointments++;
    }

    console.log(`✅ ${totalAppointments} consultas criadas`);

    // 4. ADICIONAR ALGUMAS NOTAS DE CONSULTA
    console.log("\n📝 Adicionando notas de consulta...");
    const appointmentsWithNotes = await client.query(`
      SELECT id FROM appointments 
      WHERE appointment_status = 'completed' 
      ORDER BY RANDOM() 
      LIMIT 50
    `);

    const sampleNotes = [
      "Paciente apresentou significativa melhora dos sintomas após tratamento iniciado.",
      "Exames laboratoriais dentro da normalidade. Manter acompanhamento.",
      "Solicitados exames complementares: hemograma completo e glicemia de jejum.",
      "Paciente relatou dor persistente. Ajustada medicação para controle.",
      "Consulta de retorno - evolução satisfatória do quadro clínico.",
      "Orientações sobre dieta e exercícios físicos foram repassadas.",
      "Paciente aderente ao tratamento. Próximo retorno em 3 meses.",
      "Identificada necessidade de acompanhamento com especialista.",
      "Sinais vitais estáveis. Paciente apresenta boa resposta ao tratamento.",
      "Discussão sobre fatores de risco e medidas preventivas.",
    ];

    for (const appointment of appointmentsWithNotes.rows) {
      const note = sampleNotes[Math.floor(Math.random() * sampleNotes.length)];
      await client.query(
        `
        INSERT INTO appointment_notes (appointment_id, note, created_by, created_at)
        VALUES ($1, $2, 'Sistema', NOW())
      `,
        [appointment.id, note],
      );
    }

    console.log(
      `✅ ${appointmentsWithNotes.rows.length} notas de consulta adicionadas`,
    );

    // 5. ESTATÍSTICAS FINAIS
    console.log("\n📊 ESTATÍSTICAS FINAIS:");

    const stats = await client.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM doctors WHERE clinic_id = $1) as total_doctors,
        (SELECT COUNT(*) FROM patients WHERE clinic_id = $1) as total_patients,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1) as total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND appointment_status = 'completed') as completed_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND appointment_status = 'confirmed') as confirmed_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND appointment_status = 'pending') as pending_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND appointment_status = 'cancelled') as cancelled_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND payment_status = 'paid') as paid_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND payment_status = 'pending') as pending_payments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND payment_status = 'overdue') as overdue_payments
    `,
      [clinicId],
    );

    const s = stats.rows[0];
    console.log(`👨‍⚕️ Médicos: ${s.total_doctors}`);
    console.log(`👥 Pacientes: ${s.total_patients}`);
    console.log(`📅 Consultas: ${s.total_appointments}`);
    console.log(`   ✅ Realizadas: ${s.completed_appointments}`);
    console.log(`   ✔️ Confirmadas: ${s.confirmed_appointments}`);
    console.log(`   ⏳ Pendentes: ${s.pending_appointments}`);
    console.log(`   ❌ Canceladas: ${s.cancelled_appointments}`);
    console.log(`💰 Pagamentos:`);
    console.log(`   ✅ Pagos: ${s.paid_appointments}`);
    console.log(`   ⏳ Pendentes: ${s.pending_payments}`);
    console.log(`   🔴 Em atraso: ${s.overdue_payments}`);

    console.log("\n🎉 BASE DE DADOS ROBUSTA CRIADA COM SUCESSO!");
    console.log(
      "📈 O sistema agora tem dados suficientes para demonstrar todos os gráficos e relatórios.",
    );
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await client.end();
  }
}

generateData();
