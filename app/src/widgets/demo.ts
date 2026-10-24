import type { WidgetInput } from "./snapshot";

/**
 * Dados de demonstração, iguais ao exemplo do Figma.
 * Usados até as telas das specs 001 a 003 e o backend fornecerem os dados reais.
 */
export function demoWidgetInput(now: Date): WidgetInput {
  return {
    signedIn: true,
    queue: { position: 42, total: 118, positionWeekAgo: 45, positionMonthAgo: 53 },
    exams: [
      {
        name: "Ressonância",
        status: "pendente",
        dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      },
      { name: "Raio-X", status: "em_analise" },
      { name: "Exame de sangue", status: "recebido" },
    ],
    faceIdEnabled: false,
    variant: "padrao",
    updatedAt: now,
  };
}
