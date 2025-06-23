const dayjs = require("dayjs");

console.log("Teste do dayjs para verificar início da semana:");
const today = dayjs();
console.log("Hoje:", today.format("YYYY-MM-DD dddd"));
console.log("Dia da semana (0=domingo):", today.day());

const startOfWeek = today.startOf("week");
console.log("Início da semana:", startOfWeek.format("YYYY-MM-DD dddd"));
console.log("Dia da semana do início (0=domingo):", startOfWeek.day());

const endOfWeek = startOfWeek.add(6, "days");
console.log("Fim da semana:", endOfWeek.format("YYYY-MM-DD dddd"));
console.log("Dia da semana do fim (6=sábado):", endOfWeek.day());

console.log("\nURL que seria gerada:");
console.log(
  `/dashboard?from=${startOfWeek.format("YYYY-MM-DD")}&to=${endOfWeek.format("YYYY-MM-DD")}`,
);
