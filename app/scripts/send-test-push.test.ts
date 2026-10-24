import { execFileSync } from "node:child_process";
import path from "node:path";
import { tabFromNotification } from "../src/notifications/push";
import { extractWidgetPayload } from "../src/widgets/background-logic";
import { parseWidgetPayload } from "../src/widgets/remote";

const SCRIPT = path.join(__dirname, "send-test-push.mjs");
const TYPES = ["posicao_mudou", "exame_em_analise", "exame_pendente", "documento_recebido"];

describe("script de push de teste", () => {
  it.each(TYPES)("o payload de %s é aceito pelo app", (type) => {
    const output = execFileSync(process.execPath, [SCRIPT, "ExponentPushToken[x]", type, "--dry-run"], {
      encoding: "utf8",
    });
    const message = JSON.parse(output);

    expect(parseWidgetPayload(extractWidgetPayload({ data: message.data }))).not.toBeNull();
    expect(tabFromNotification(message.data)).toBe(type === "posicao_mudou" ? "inicio" : "documentos");
    expect(message._contentAvailable).toBe(true);
  });
});
