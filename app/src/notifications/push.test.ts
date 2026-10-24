import {
  ANDROID_CHANNEL,
  PERMISSION_EXPLANATION,
  ensurePushPermission,
  registerPushToken,
  tabFromNotification,
  type PermissionApi,
} from "./push";

function permissionApi(status: "granted" | "denied" | "undetermined", requestResult = status) {
  const api: PermissionApi = {
    getStatus: jest.fn(async () => status),
    request: jest.fn(async () => requestResult),
  };
  return api;
}

describe("permissão de notificação", () => {
  it("explica para que serve antes de pedir, em linguagem simples", async () => {
    const api = permissionApi("undetermined", "granted");
    const explain = jest.fn(async () => true);

    await expect(ensurePushPermission(api, explain)).resolves.toBe(true);

    expect(explain).toHaveBeenCalledWith(PERMISSION_EXPLANATION);
    expect(api.request).toHaveBeenCalled();
    expect(PERMISSION_EXPLANATION.message).not.toMatch(/urgente|atenção/i);
  });

  it("não pede de novo a quem já respondeu", async () => {
    const granted = permissionApi("granted");
    const denied = permissionApi("denied");
    const explain = jest.fn(async () => true);

    await expect(ensurePushPermission(granted, explain)).resolves.toBe(true);
    await expect(ensurePushPermission(denied, explain)).resolves.toBe(false);

    expect(explain).not.toHaveBeenCalled();
    expect(granted.request).not.toHaveBeenCalled();
    expect(denied.request).not.toHaveBeenCalled();
  });

  it("respeita quem escolhe 'agora não' na explicação, sem abrir o pedido do sistema", async () => {
    const api = permissionApi("undetermined");
    await expect(ensurePushPermission(api, async () => false)).resolves.toBe(false);
    expect(api.request).not.toHaveBeenCalled();
  });
});

describe("registro do token de push", () => {
  it("envia o token ao backend quando há permissão e é um aparelho real", async () => {
    const send = jest.fn(async () => {});
    const token = await registerPushToken({
      isDevice: true,
      hasPermission: true,
      getToken: async () => "ExponentPushToken[abc]",
      send,
    });
    expect(token).toBe("ExponentPushToken[abc]");
    expect(send).toHaveBeenCalledWith("ExponentPushToken[abc]");
  });

  it("não registra em simulador ou sem permissão", async () => {
    const send = jest.fn(async () => {});
    const getToken = jest.fn(async () => "x");
    await expect(
      registerPushToken({ isDevice: false, hasPermission: true, getToken, send }),
    ).resolves.toBeNull();
    await expect(
      registerPushToken({ isDevice: true, hasPermission: false, getToken, send }),
    ).resolves.toBeNull();
    expect(send).not.toHaveBeenCalled();
  });

  it("falha no registro não derruba o app", async () => {
    await expect(
      registerPushToken({
        isDevice: true,
        hasPermission: true,
        getToken: async () => {
          throw new Error("sem rede");
        },
        send: async () => {},
      }),
    ).resolves.toBeNull();
  });
});

describe("toque na notificação", () => {
  it("abre a aba do link enviado no push", () => {
    expect(tabFromNotification({ url: "pulse://documentos" })).toBe("documentos");
  });

  it("sem link, abre a aba certa pelo tipo do aviso", () => {
    expect(tabFromNotification({ type: "posicao_mudou" })).toBe("inicio");
    expect(tabFromNotification({ type: "exame_em_analise" })).toBe("documentos");
    expect(tabFromNotification({ type: "exame_pendente" })).toBe("documentos");
    expect(tabFromNotification({ type: "documento_recebido" })).toBe("documentos");
    expect(tabFromNotification({ type: "analise_concluida" })).toBe("inicio");
  });

  it("aviso desconhecido abre o Início", () => {
    expect(tabFromNotification({})).toBe("inicio");
    expect(tabFromNotification(undefined)).toBe("inicio");
  });
});

describe("canal do Android", () => {
  it("tem nome em português para as configurações do sistema", () => {
    expect(ANDROID_CHANNEL).toEqual({ id: "avisos-da-fila", name: "Avisos da fila" });
  });
});
