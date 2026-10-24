# Plano: Widgets e avisos (parte do paciente, iPhone e Android)

Spec: ./spec.md
Status: em revisão

## Abordagem

Este plano cobre a parte do paciente. A parte do médico é implementada no SUSight-Web (spec 010 de lá).

Os widgets são nativos em cada sistema:

- **iPhone:** extensão WidgetKit em SwiftUI, criada pelo config plugin `@bacons/apple-targets`.
- **Android:** widgets de tela inicial com `react-native-android-widget`. Eles são escritos em TSX e o Android os desenha como widgets nativos.

Toda a regra fica em TypeScript e é testada com Jest: posição, anel, exames, próximo exame, variação da semana e do mês, privacidade, textos e a frase lida pelo leitor de tela. Esse cálculo produz um "retrato", que cada sistema só desenha.

A atualização sem abrir o app acontece de três formas:

1. **Push notification:** o backend manda o aviso com os dados novos. Uma tarefa em segundo plano (`expo-notifications` com `expo-task-manager`) recebe o push mesmo com o app fechado, monta o retrato e atualiza os widgets.
2. **Atualização periódica:** o `expo-background-task` busca os dados na API de tempos em tempos. Usa o BGTaskScheduler no iPhone e o WorkManager no Android, a cada 15 minutos no mínimo.
3. **Ao abrir o app:** o retrato é atualizado sempre que o app abre.

## Dados e interfaces

- **Retrato (`app/src/widgets/snapshot.ts`):** além do que já existe, ganha:
  - `nextExam`: nome e prazo, ex.: "Enviar até sexta";
  - `week`: valor e legenda, ex.: "↑ 3" e "posições";
  - `accessibilityText`: a frase completa para VoiceOver e TalkBack.
  - A entrada passa a aceitar `positionWeekAgo` e o prazo (`dueDate`) de cada exame.
- **Dados do backend (`app/src/widgets/remote.ts`):** `parseWidgetPayload(json)` valida o que chega no push ou na API e converte para a entrada do retrato. Pedido ao SUSight-Backend:
  - `GET /me/widget`, que devolve `{ queue: { position, total, positionWeekAgo, positionMonthAgo }, exams: [{ name, status, dueDate }], updatedAt }`;
  - push com `data: { type, url, widget }`, com o mesmo formato em `widget` e `content-available` no iPhone.
- **Atualização em segundo plano (`app/src/widgets/background.ts`):**
  - tarefa `WIDGET_PUSH_TASK`, que recebe o push, valida, monta o retrato e chama `refreshAllWidgets`;
  - tarefa `WIDGET_REFRESH_TASK`, periódica, que busca `GET /me/widget` com o token guardado no `expo-secure-store` e faz o mesmo.
  - Sem token, nada é buscado.
- **Push (`app/src/notifications/`):**
  - pedido de permissão com explicação;
  - registro do token do Expo (`POST /me/push-token`, pedido ao backend);
  - canal Android "Avisos da fila";
  - toque na notificação abre a aba de `data.url` com `tabFromUrl`.
- **Widgets Android (`app/src/widgets/android/`):**
  - `PositionWidget`, o largo, com anel e exames;
  - `NextExamWidget`;
  - `WeekWidget`;
  - `widgetTaskHandler`, que desenha a partir do último retrato salvo.
  - Os nomes ficam no `app.json` pelo plugin.
- **Atualização dos dois sistemas (`app/src/widgets/refresh.ts`):** `refreshAllWidgets(snapshot)` grava no App Group no iPhone e pede o redesenho dos widgets no Android.
- **iPhone (`app/targets/widgets/`):** os widgets usam `accessibilityText` como rótulo único (`.accessibilityElement(children: .ignore)`), e o anel e os marcadores ficam escondidos do VoiceOver.
- **Teste sem backend (`app/scripts/send-test-push.mjs`):** manda um push de teste, com dados de widget, pelo serviço de push do Expo para o token do aparelho.

## Decisões

| Decisão | Alternativas consideradas | Motivo |
|---|---|---|
| WidgetKit (SwiftUI) no iPhone e `react-native-android-widget` no Android | Glance em Kotlin; uma biblioteca só para os dois | São widgets nativos de cada sistema. No Android, a biblioteca usa TSX e reaproveita o retrato e os testes. |
| Push com os dados do widget, tratado em segundo plano | Push só com texto, e o app busca depois | O widget atualiza na hora, sem precisar de rede extra. Se o payload faltar, a tarefa busca na API. |
| `expo-background-task` como reserva periódica | Só push | Cobre push perdido ou atrasado, e o sistema decide o melhor momento para economizar bateria. |
| Token em `expo-secure-store` (Keychain e Keystore) | AsyncStorage; App Group | A tarefa em segundo plano precisa do token, e ele não pode ficar em armazenamento sem criptografia (LGPD). |
| Serviço de push do Expo | APNs e FCM direto | Um envio só para os dois sistemas. Dá para trocar depois sem mudar o app. |
| Frase do leitor de tela montada em TypeScript | Rótulos separados por elemento | Fica testada, igual nos dois sistemas, e lida como uma frase só (spec 004, item 10). |
| Texto com estilos do sistema no iPhone e `sp` no Android | Tamanhos fixos | Segue Dynamic Type e o tamanho de fonte do Android. |
| "Analisando seu exame" sem o indicador circular do Figma | Notificação customizada | As notificações do Expo não desenham progresso customizado. Fica a notificação padrão com o texto. |

## Riscos

- **O backend ainda não tem `GET /me/widget`, `POST /me/push-token` nem o envio de push.** Mitigação: o script de push de teste e os dados de demonstração permitem testar tudo. O contrato fica descrito acima para a equipe do backend.
- **O login do paciente (spec 005) ainda não existe.** Sem token, a atualização periódica não roda. Mitigação: as tarefas verificam o token e o push leva os dados no próprio payload.
- **O iOS limita o tempo e a frequência das tarefas em segundo plano** e pode atrasar a atualização periódica. Mitigação: o push com dados é o caminho principal.
- **Esta máquina é Linux.** O Swift e o Android nativo não são compilados aqui. Mitigação: as regras ficam em TypeScript com testes, o `expo prebuild` valida a configuração dos dois sistemas, e o build roda no EAS ou num Mac.
- **Push exige credenciais** (APNs no Apple Developer e FCM no Firebase) configuradas no EAS. Mitigação: o README explica a configuração.
