#!/usr/bin/env node
// Push de teste para validar avisos e widgets sem o backend (spec 004).
// Uso: npm run push:test -- <ExponentPushToken[...]> [tipo] [--dry-run]
// Tipos: posicao_mudou (padrão), exame_em_analise, exame_pendente, documento_recebido.

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const now = new Date().toISOString();
const widget = (position, exams) => ({
  queue: { position, total: 118, positionWeekAgo: 45, positionMonthAgo: 53 },
  exams,
  updatedAt: now,
});

// Textos do Figma (notificações do paciente, nós 101-583 e 102-4610).
const EXAMPLES = {
  posicao_mudou: {
    title: "Sua posição mudou",
    body: "Você agora é a 31ª.",
    url: "pulse://inicio",
    widget: widget(31, [{ name: "Ressonância", status: "pendente" }]),
  },
  exame_em_analise: {
    title: "Analisando seu exame",
    body: "Raio-X em análise.",
    url: "pulse://documentos",
    widget: widget(42, [{ name: "Raio-X", status: "em_analise" }]),
  },
  exame_pendente: {
    title: "Falta um exame",
    body: "Envie o laudo da ressonância.",
    url: "pulse://documentos",
    widget: widget(42, [{ name: "Ressonância", status: "pendente" }]),
  },
  documento_recebido: {
    title: "Documento recebido",
    body: "Seu raio-X está em análise.",
    url: "pulse://documentos",
    widget: widget(42, [{ name: "Raio-X", status: "recebido" }]),
  },
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const [token, type = "posicao_mudou"] = args.filter((a) => !a.startsWith("--"));
const example = EXAMPLES[type];

if (!token || !example) {
  console.error(
    `Uso: npm run push:test -- <ExponentPushToken[...]> [${Object.keys(EXAMPLES).join(" | ")}] [--dry-run]`,
  );
  console.error("O token aparece no log do app ao abrir (\"Token de push\").");
  process.exit(1);
}

const message = {
  to: token,
  title: example.title,
  body: example.body,
  data: { type, url: example.url, widget: example.widget },
  // Acorda o app em segundo plano no iPhone para atualizar os widgets.
  _contentAvailable: true,
  channelId: "avisos-da-fila",
  priority: "high",
};

if (dryRun) {
  console.log(JSON.stringify(message, null, 2));
  process.exit(0);
}

const response = await fetch(EXPO_PUSH_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify(message),
});
console.log(response.status, JSON.stringify(await response.json(), null, 2));
process.exit(response.ok ? 0 : 1);
