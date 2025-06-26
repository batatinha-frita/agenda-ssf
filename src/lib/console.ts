// Configuração para desabilitar console.log em produção
const originalLog = console.log;
const originalWarn = console.warn;
const originalInfo = console.info;

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}

// Para desenvolvimento, podemos filtrar logs específicos
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log = (...args: any[]) => {
    // Filtrar logs que começam com certas palavras-chave
    const message = args[0];
    if (typeof message === "string") {
      const skipPatterns = [
        "Dados operacionais",
        "Frequent patients",
        "Operational data:",
        "Mock data being used:",
        "Payments data:",
        "Attendance chart data:",
        "Dados de pagamentos",
        "Pacientes encontrados:",
        "Buscando pacientes",
        "Usuário autenticado:",
        "Dados da sessão:",
        "ID da clínica:",
        "Pacientes demographics",
        "Error: EINVAL:",
        "Warning:",
        "Console was cleared",
        "React DevTools",
      ];

      const shouldSkip = skipPatterns.some((pattern) =>
        message.includes(pattern),
      );

      if (!shouldSkip) {
        originalLog.apply(console, args);
      }
    } else {
      originalLog.apply(console, args);
    }
  };
}
