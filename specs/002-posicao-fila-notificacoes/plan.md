# Plano: Início, posição na fila e notificações

Spec: ./spec.md
Status: rascunho

## Abordagem

Esta spec é a base do app, então o plano também define a fundação usada pelas outras specs.

App React Native com Expo (SDK 58) e TypeScript na pasta `app/`. Navegação com expo-router: uma pilha na raiz e quatro abas (Início, Documentos, Histórico, Perfil) com a barra flutuante do Figma. Estilos com `StyleSheet` e os tokens do Figma em `src/theme.ts`. Os ícones são os SVGs exportados do Figma em `assets/figma/`, exibidos com `expo-image`. O anel de posição é desenhado com `react-native-svg`, porque depende da posição e do total.

Os dados passam por `src/api.ts`. O backend ainda não tem rotas para o paciente, então a camada devolve dados de exemplo em memória com a mesma forma que a API terá. Trocar por `fetch` não muda as telas.

A abertura (41-4) aparece enquanto a sessão é restaurada. Sem conexão, as telas mantêm o último dado carregado e mostram o aviso "Sem conexão com a internet" (92-2265). Sem nenhum dado, mostram o estado de erro com "Tentar de novo" (92-2332).

## Dados e interfaces

```
app/
  src/
    app/                rotas do expo-router
      _layout.tsx       pilha raiz, sessão e abertura
      login.tsx, code.tsx
      (tabs)/_layout.tsx, index.tsx, documents.tsx, history.tsx, profile.tsx
      notifications.tsx, new-document.tsx
      contacts/index.tsx, contacts/new.tsx, contacts/[id].tsx, privacy.tsx
    api.ts              tipos do domínio e dados de exemplo
    session.tsx         sessão, Face ID e preferências
    useLoad.ts          carregamento com último dado conhecido
    theme.ts            cores, tipografia e sombra do Figma
    components/         componentes do design system
  assets/figma/         ícones exportados do Figma
```

Funções de `api.ts` usadas aqui: `getHome()` (paciente, solicitação, situação atual, acontecimentos) e `getNotifications()`.

A posição exibida é sempre a da fila oficial aprovada (`request.position`). A camada não expõe propostas da IA.

## Decisões

| Decisão | Alternativas consideradas | Motivo |
|---|---|---|
| Expo com expo-router | React Native CLI, React Navigation direto | Rotas por arquivo e build sem Xcode configurado à mão |
| Dados de exemplo em `api.ts` | Mock Service Worker, servidor fake | O backend não tem rotas de paciente; uma função por tela basta |
| `StyleSheet` com tokens | NativeWind, Tamagui | Sem dependência nova; poucos tokens |
| SVGs do Figma com `expo-image` | Fonte de ícones, redesenhar | Usa os ícones do design sem conversão |
| Barra de abas própria | Barra padrão | O Figma usa uma barra flutuante com pílula na aba ativa |
| Último dado em memória | Cache persistente | A sessão atual guarda os dados em memória; offline persistente está fora do MVP |
| Sem push real | expo-notifications | Push real está fora do MVP; a lista de notificações vem da API |

## Riscos

- O contrato real da API pode divergir dos tipos. Mitigação: tipos num arquivo só.
- Textos do Figma que contradizem as specs (confirmação de documento, relato do paciente). Mitigação: o app segue a spec e os textos foram ajustados.

## Complemento: notificações persistentes

Integrar à navegação e às telas existentes da `dev`.


Spec: ./spec.md
Status: em revisão

## Abordagem

Este plano cobre a parte de notificações da spec 002 (itens 2, 10 a 12 e 14): o sino com o ponto de novo, a tela de notificações (42-816), os avisos por push e a navegação por abas, que é onde o toque no aviso chega. O conteúdo do Início (cartões de posição, cirurgia, motivo e situação, itens 1 e 3 a 9) e o modo sem conexão (item 13) ficam para um próximo plano da mesma spec.

As push notifications já chegam ao iPhone e ao Android pela spec 004: permissão com explicação, registro do token, canal Android e tarefa em segundo plano. Este plano reaproveita isso e acrescenta:

1. **Caixa de notificações:** todo aviso recebido vira um item guardado no aparelho, com título, texto, data e lido ou não. O item entra pelo push com o app aberto, pelo toque no aviso, pela tarefa em segundo plano e pelos avisos que ainda estão na central do sistema quando o app abre. Com o backend configurado, a lista também vem de `GET /me/notifications`. Os itens se juntam pelo `id`, sem repetir.
2. **Só avisos conhecidos:** o app aceita apenas os tipos da spec 002 e da 004. Qualquer outro tipo, como uma proposta rejeitada ou uma reavaliação interna da IA, é descartado e não aparece na lista.
3. **Telas:** abas com a barra flutuante do Figma, Início com o sino, tela de notificações com o "Voltar". Documentos, Histórico e Perfil ficam como telas vazias até as specs 001 e 003.

Toda a regra fica em TypeScript puro e é testada com Jest. As telas são testadas com a React Native Testing Library.

Quem escreve o texto de cada aviso é o backend, porque ele conhece a posição e o motivo. O app valida, guarda e mostra. Os exemplos do script de push de teste e da demonstração seguem as regras da spec: nova posição com motivo em linguagem simples, sem alarme e sem data de cirurgia.

## Dados e interfaces

- **Tipos de aviso (`app/src/notifications/push.ts`):** `posicao_mudou`, `exame_pendente`, `documento_recebido`, `exame_em_analise` e, novo, `analise_concluida` (análise terminou sem mudança de posição). Toque em `analise_concluida` abre o Início.
- **Push:** o `data` ganha `id` e `sentAt`. Formato completo: `data: { id, type, url, sentAt, widget }`, com título e texto no próprio aviso.
- **Caixa (`app/src/notifications/inbox.ts`):**
  - `parseNotification(content)`: valida o aviso e devolve o item ou `null`;
  - `mergeInbox(current, incoming)`: junta pelo `id`, ordena do mais novo para o mais velho e guarda no máximo 50;
  - `markRead(inbox, id)` e `unreadCount(inbox)`;
  - `markerFor(item)`: cor do ponto (novo, novo pedindo ação, lido);
  - `formatShortDate(date)`: "20 out".
- **Armazenamento (`app/src/notifications/inbox-store.ts`):** guarda a caixa no AsyncStorage e avisa a tela quando muda (`useSyncExternalStore`).
- **Captura (`app/src/notifications/capture.ts`):** liga o recebimento com o app aberto, o toque, os avisos que ainda estão na central e a tarefa em segundo plano à caixa.
- **Backend:** pedido ao SUSight-Backend de `GET /me/notifications`, que devolve `[{ id, type, title, body, sentAt }]`. Sem `EXPO_PUBLIC_API_URL`, a caixa começa com itens de demonstração.
- **Telas (`app/src/screens/`, `app/src/ui/`):** `AppShell` (aba atual e tela de notificações), `TabBar`, `HomeScreen` com `NotificationBell`, `NotificationsScreen` e telas vazias das outras abas.
- **Tokens (`app/src/ui/theme.ts`):** cores e textos do Figma (Pulse/Corpo, Pulse/Subtítulo destaque, Pulse/Nota, Pulse/Aba e a sombra suave).

## Decisões

| Decisão | Alternativas consideradas | Motivo |
|---|---|---|
| Caixa guardada no aparelho e completada pela API | Só a API; só o que chegou por push | A lista abre sem rede e mostra o aviso na hora. A API traz o que chegou com o app desinstalado ou em outro aparelho. |
| "Lido" guardado no aparelho | Marcar como lido na API | Não há rota para isso no backend ainda. Fica fácil trocar depois. |
| Navegação por estado no `AppShell` | React Navigation; Expo Router | São quatro abas e uma tela. Evita uma dependência grande antes das specs 001 e 003 definirem o resto da navegação. |
| Ícones do Figma com `react-native-svg` e a cor do traço pelo estado da aba | PNG; ícones de biblioteca | Mesmos ícones do Figma, e a cor muda entre aba ativa e inativa. |
| Textos com a fonte do sistema e tamanho que acompanha o do aparelho | SF Pro embutida | A SF Pro é a fonte do iPhone. O Android usa a fonte dele. O Dynamic Type e o tamanho da fonte do Android continuam funcionando. |
| Ponto rosa forte para novo, rosa claro para novo que pede ação, cinza para lido | Uma cor só | É o que o Figma mostra. A cor nunca é a única pista: o leitor de tela diz "novo" e "pede ação". |

## Riscos

- **A tela 42-816 tem textos que não valem mais** ("Precisamos de uma confirmação", "Atualização analisada"). Mitigação: a demonstração usa os avisos da spec (exame pendente, documento recebido, posição mudou, análise concluída), com o visual do Figma.
- **`GET /me/notifications` e o `id` no push dependem do backend.** Mitigação: sem `id`, o app usa o identificador do aviso no aparelho. Sem backend, usa a demonstração.
- **Desligar tipos de aviso é da spec 003.** O backend é quem deixa de enviar. O app não filtra nada além dos tipos desconhecidos.
