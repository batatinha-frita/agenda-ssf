const { execSync } = require("child_process");

try {
  console.log("🔍 Verificando erros de TypeScript...");

  // Verificar compilação TypeScript
  const result = execSync("npx tsc --noEmit --skipLibCheck", {
    encoding: "utf8",
    cwd: process.cwd(),
  });

  console.log("✅ Nenhum erro de TypeScript encontrado!");
} catch (error) {
  console.log("❌ Erros encontrados:");
  console.log(error.stdout);
  console.log(error.stderr);
}
