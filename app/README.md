# SUSight (app do paciente)

App em Expo (React Native) para o paciente acompanhar a fila do SUS, no iPhone e no Android.

## Como rodar

Pré-requisitos: Node 22 e npm.

```bash
npm install
npm test          # testes (Jest)
npm run typecheck # checagem de tipos
```

O app usa **development build**. O Expo Go não carrega widgets nem tarefas em segundo plano.

- **iPhone, simulador (macOS com Xcode):** `npm run ios`.
- **Android, emulador ou aparelho (Android Studio):** `npm run android`.
- **Sem Mac ou Android Studio:** `npx eas build --profile development --platform ios` (ou `android`). É preciso uma conta Expo.

Variável de ambiente opcional:

| Variável | Para quê |
|---|---|
| `EXPO_PUBLIC_API_URL` | Endereço do SUSight-Backend. Sem ela, o app usa dados de demonstração e só mostra o token de push no log. |

## Widgets (spec 004)

| Sistema | Widgets | Onde fica o código |
|---|---|---|
| iPhone | Pequeno e médio, nativos em SwiftUI (WidgetKit) | [targets/widgets](targets/widgets), pelo plugin `@bacons/apple-targets` |
| Android | Largo, "Próximo exame" e "Esta semana", nativos | [src/widgets/android](src/widgets/android), pela biblioteca `react-native-android-widget` |

As pastas `ios/` e `android/` são geradas pelo `npx expo prebuild` e não vão para o git.

Como os dados chegam aos widgets:

1. `buildWidgetSnapshot` ([src/widgets/snapshot.ts](src/widgets/snapshot.ts)) monta um retrato pronto para exibir. Toda regra e todo texto ficam aqui, inclusive a frase lida pelo leitor de tela, testados com Jest.
2. `refreshAllWidgets` ([src/widgets/refresh.ts](src/widgets/refresh.ts)) grava o retrato no App Group do iPhone e no armazenamento do Android, e pede para os widgets se redesenharem.
3. Cada sistema só desenha o retrato.

### Atualização com o app fechado

- **Push com dados:** o push traz o campo `widget` com o formato de `GET /me/widget`. Uma tarefa em segundo plano ([src/widgets/background.ts](src/widgets/background.ts)) recebe o push, valida os dados e atualiza os widgets. Se o push não trouxer `widget`, a tarefa busca `GET /me/widget`.
- **Atualização periódica:** a cada 15 minutos no mínimo, quando o sistema permitir, busca `GET /me/widget` com o token guardado no Keychain ou no Keystore.
- **Ao abrir o app.**

As telas das specs 001 a 003 e os widgets usam a mesma fonte de dados do app ([src/api.ts](src/api.ts)). Enquanto as rotas do paciente não estão integradas ao backend, os dados são fictícios. A integração ([src/widgets/WidgetBridge.tsx](src/widgets/WidgetBridge.tsx)) atualiza os widgets após o login, ao trocar de tela e ao voltar ao app. Ao sair da conta, limpa os dados dos widgets. As preferências de Face ID também são aplicadas aos widgets.

A entrada `index.ts` registra as tarefas dos widgets e carrega o Expo Router. Os links `pulse://inicio` e `pulse://documentos` abrem as telas Início e Documentos; o esquema `susight://` continua disponível. O token usado em segundo plano vem da mesma sessão do login, com a mesma expiração. Sem sessão válida, um push não repõe os dados apagados ao sair da conta.

### Pedidos ao SUSight-Backend

- `GET /me/widget` devolve `{ queue: { position, total, positionWeekAgo, positionMonthAgo } | null, exams: [{ name, status, dueDate? }], updatedAt }`. O `status` é `pendente`, `recebido` ou `em_analise`.
- `POST /me/push-token` com `{ token }`.
- `GET /me/notifications` devolve `[{ id, type, title, body, sentAt }]`, a lista do sino (spec 002).
- Push pelo serviço do Expo, com `data: { id, type, url, sentAt, widget }` e `_contentAvailable: true`. Os tipos são `posicao_mudou`, `exame_em_analise`, `exame_pendente`, `documento_recebido` e `analise_concluida`.

## Push notifications

1. Configure as credenciais no EAS:
   - **iPhone:** `npx eas credentials`, chave APNs (precisa de conta Apple Developer).
   - **Android:** crie um projeto no Firebase, coloque o `google-services.json` na pasta `app/`, aponte `android.googleServicesFile` no `app.json` e envie a chave FCM V1 com `npx eas credentials`.
2. Gere o development build e abra o app num **aparelho real**, porque simuladores não recebem push. Aceite os avisos. O token aparece no log como "Token de push".
3. Mande um push de teste:

```bash
npm run push:test -- "ExponentPushToken[...]" posicao_mudou
# outros tipos: exame_em_analise, exame_pendente, documento_recebido, analise_concluida
# --dry-run mostra o payload sem enviar
```

Com o app fechado, o widget deve mudar para a posição do push (31ª no exemplo de `posicao_mudou`).

## Notificações no app (spec 002)

O sino do Início mostra um ponto quando há avisos novos e abre a tela de notificações. Todo aviso que chega ao aparelho entra nessa lista: com o app aberto, tocado, ainda na central do sistema ao abrir o app, ou recebido com o app fechado pela tarefa em segundo plano. Com `EXPO_PUBLIC_API_URL`, a lista também vem de `GET /me/notifications`. Sem backend, ela começa com avisos de demonstração.

- O ponto é rosa forte para aviso novo, rosa claro para exame pedido ainda não lido e cinza para aviso lido.
- Tocar num aviso marca como lido e abre a tela dele: Início para posição e análise concluída, Documentos para os avisos de exame e documento.
- O app só aceita os tipos acima. Rejeição pelo médico, reavaliação da IA ou qualquer outro tipo é descartado.
- Documentos, Histórico e Perfil ainda são telas vazias (specs 001 e 003). O Início tem só o topo com o sino; os cartões vêm no próximo plano da spec 002.

Para testar sem backend, mande um push com `npm run push:test` (ver acima) e abra o sino.

## Testar os widgets

**iPhone:** abra o app e entre com a conta de demonstração descrita no README principal. Na tela inicial, toque e segure, toque em "+", procure "SUSight" e adicione os widgets pequeno e médio. O pequeno abre o Início. No médio, o anel abre o Início e a lista abre Documentos. Sem login, os widgets mostram o convite para abrir o app.

**Android:** abra o app uma vez. Toque e segure na tela inicial, escolha "Widgets", procure "SUSight" e adicione os três.

Para testar num iPhone de verdade, é preciso uma conta Apple Developer e o `ios.appleTeamId` no `app.json`, por causa do App Group.

### Acessibilidade

- **VoiceOver (iPhone) e TalkBack (Android):** cada widget é lido como uma frase completa, ex.: "Sua posição na fila: 42ª de 118. 1 exame pendente. Subiu 11 posições este mês." O anel e os marcadores não são lidos.
- **Dynamic Type (iPhone) e tamanho da fonte (Android):** os textos acompanham o tamanho escolhido no sistema. Teste com os maiores tamanhos em Ajustes > Acessibilidade > Tela e Tamanho do Texto (iPhone) e Configurações > Tela > Tamanho da fonte (Android).

## Critérios de aceite e testes

| Critério (spec 004, paciente) | Como é verificado |
|---|---|
| Widget de posição no iPhone, pequeno e médio | Manual, no simulador. A extensão é SwiftUI e não roda no Jest. |
| Widgets do Android: largo, "Próximo exame" e "Esta semana" | `android/widgets.test.tsx` (textos, links e leitor de tela). Aparência verificada no emulador. |
| Dados coincidem com Início e Documentos | `WidgetBridge.test.tsx`, `snapshot.test.ts` e `demo.test.ts`. A integração usa os dados das mesmas rotas do app. |
| Atualizam após mudança aprovada ou exame pedido, sem abrir o app | `background-logic.test.ts` (push e atualização periódica) e `refresh.test.ts` (os dois sistemas). Verificação de ponta a ponta com `npm run push:test` e o app fechado. |
| Tocar abre o app na tela correta, sem ações | `links.test.ts`, `push.test.ts` e `android/widgets.test.tsx`. O toque no iPhone é verificado no simulador. |
| Push de posição, exame em análise, exame faltando e documento recebido | `push.test.ts` (permissão, token e toque) e `send-test-push.test.ts` (payload). A entrega no aparelho depende das credenciais e do backend. |
| Sem conexão, mostram a última informação com data | `snapshot.test.ts` e `background-logic.test.ts` (falha de rede mantém o último widget). A troca pela data depois de um dia está em `Snapshot.swift` (`isStale`). |
| "Subiu X posições" só quando subiu | `snapshot.test.ts`. |
| Aparelho bloqueado com Face ID: posição escondida | `snapshot.test.ts` (`hideWhenLocked`). O iPhone esconde com `.privacySensitive()`; verificado no aparelho bloqueado. |
| Tamanho de texto do sistema, alvos de 44 pt e contraste | `android/widgets.test.tsx` (fonte do Android). Dynamic Type e contraste verificados manualmente. |
| VoiceOver e TalkBack leem uma frase completa | `snapshot.test.ts` (frase) e `android/widgets.test.tsx` (rótulos). VoiceOver verificado no simulador. |
| Português do Brasil, sem alarme e sem prometer data de cirurgia | `snapshot.test.ts` e `push.test.ts`. |

| Critério (spec 002, notificações e abas) | Como é verificado |
|---|---|
| As quatro abas funcionam e a ativa é destacada | `tab-bar.test.tsx` e `app-shell.test.tsx`. |
| Aprovação que muda a posição gera aviso com nova posição e motivo | `send-test-push.test.ts` e `remote.test.ts` (textos de exemplo). O texto real vem do backend. |
| Documento recebido e pedido de exame geram aviso | `inbox.test.ts`, `capture-logic.test.ts` e `send-test-push.test.ts`. |
| Rejeição pelo médico não gera aviso | `inbox.test.ts` e `capture-logic.test.ts` (tipo desconhecido é descartado). O backend não envia esse aviso. |
| Tocar no aviso abre a tela correspondente | `push.test.ts`, `app-shell.test.tsx` e `notifications-screen.test.tsx`. |
| O sino mostra o ponto de aviso novo e abre as notificações | `notification-bell.test.tsx` e `app-shell.test.tsx`. |
| Lista guardada no aparelho, sem repetir avisos | `inbox.test.ts` e `inbox-store.test.ts`. |
| Leitor de tela lê cada aviso como frase, sem depender da cor | `notifications-screen.test.tsx`. VoiceOver e TalkBack verificados no aparelho. |
| Português do Brasil, sem alarme e sem prometer data de cirurgia | `remote.test.ts` e `send-test-push.test.ts`. |

Limitação conhecida: a notificação "Analisando seu exame" do Android não mostra o indicador circular de progresso do Figma, porque as notificações do Expo não desenham progresso customizado.
