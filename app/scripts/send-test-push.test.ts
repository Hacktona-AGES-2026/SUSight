import { execFileSync } from "node:child_process";
import path from "node:path";
import { tabFromNotification } from "../src/notifications/push";
import { extractWidgetPayload } from "../src/widgets/background-logic";
import { parseWidgetPayload } from "../src/widgets/remote";

const SCRIPT = path.join(__dirname, "send-test-push.mjs");
const TYPES = [
  "posicao_mudou",
  "exame_em_analise",
  "exame_pendente",
  "documento_recebido",
  "analise_concluida",
];
const OPENS_HOME = ["posicao_mudou", "analise_concluida"];

describe("script de push de teste", () => {
  it.each(TYPES)("o payload de %s é aceito pelo app", (type) => {
    const output = execFileSync(process.execPath, [SCRIPT, "ExponentPushToken[x]", type, "--dry-run"], {
      encoding: "utf8",
    });
    const message = JSON.parse(output);

    expect(parseWidgetPayload(extractWidgetPayload({ data: message.data }))).not.toBeNull();
    expect(tabFromNotification(message.data)).toBe(OPENS_HOME.includes(type) ? "inicio" : "documentos");
    expect(message._contentAvailable).toBe(true);
    expect(message.data.type).toBe(type);
    expect(message.data.id).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(message.data.sentAt))).toBe(false);
  });

  it("a mudança de posição traz a nova posição e o motivo em linguagem simples", () => {
    const output = execFileSync(process.execPath, [SCRIPT, "ExponentPushToken[x]", "posicao_mudou", "--dry-run"], {
      encoding: "utf8",
    });
    const { body } = JSON.parse(output);

    expect(body).toMatch(/31ª/);
    expect(body).toMatch(/porque/i);
    expect(body).not.toMatch(/data da cirurgia|urgente|!/i);
  });
});
