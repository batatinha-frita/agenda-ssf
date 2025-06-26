// Teste rápido dos dados do médico
console.log("=== TESTE DOS DADOS DO MÉDICO ===");

// Simular o médico "teste hoje - Alergologia" que aparece na sua imagem
const testDoctor = {
  availableFromWeekDay: 1, // Segunda-feira
  availableToWeekDay: 5, // Sexta-feira
  availableFromTime: "08:00",
  availableToTime: "18:00",
};

// Simular a data selecionada (26 de junho de 2025)
const testDate = new Date("2025-06-26"); // Quinta-feira
const dayOfWeek = testDate.getDay(); // 4 = Quinta-feira

console.log("Médico:", testDoctor);
console.log("Data selecionada:", testDate.toLocaleDateString());
console.log("Dia da semana:", dayOfWeek, "(0=Dom, 1=Seg, ..., 6=Sáb)");

// Verificar se a data está disponível
const isDateAvailable =
  (testDoctor.availableFromWeekDay <= testDoctor.availableToWeekDay &&
    dayOfWeek >= testDoctor.availableFromWeekDay &&
    dayOfWeek <= testDoctor.availableToWeekDay) ||
  (testDoctor.availableFromWeekDay > testDoctor.availableToWeekDay &&
    (dayOfWeek >= testDoctor.availableFromWeekDay ||
      dayOfWeek <= testDoctor.availableToWeekDay));

console.log("Data disponível?", isDateAvailable);
console.log(
  "Motivo:",
  `Médico atende de ${testDoctor.availableFromWeekDay} a ${testDoctor.availableToWeekDay}, hoje é ${dayOfWeek}`,
);

if (isDateAvailable) {
  console.log("✅ Médico deveria gerar horários para esta data");
} else {
  console.log("❌ Médico NÃO deveria gerar horários para esta data");
}
