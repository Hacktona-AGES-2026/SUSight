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
| Push da spec 004 e caixa persistente | Lista apenas na API | O complemento integra os avisos às telas existentes |

## Riscos

- O contrato real da API pode divergir dos tipos. Mitigação: tipos num arquivo só.
- Textos do Figma que contradizem as specs (confirmação de documento, relato do paciente). Mitigação: o app segue a spec e os textos foram ajustados.

## Complemento: notificações persistentes

A base é o app completo da dev, incluindo a integração com o backend: Expo Router, abertura, login, Face ID, Início completo, Documentos e upload com termo, Histórico, Perfil, contatos, privacidade, widgets e ícone.

### Abordagem

- `inbox.ts` valida os tipos conhecidos do push, reúne pelo identificador e ordena por data.
- `inbox-store.ts` guarda até 50 avisos no AsyncStorage e avisa as telas quando a caixa muda. Ao sair, os avisos são apagados da memória e do aparelho.
- `patient-notifications.ts` usa `api.getNotifications()` e `api.markNotificationsRead()`, preservando a seleção entre demonstração e backend feita na dev. O backend real usa `GET /notificacoes` e `POST /notificacoes/{id}/lida`; não é criada uma rota paralela de API.
- O sino do Início e a rota de notificações existentes usam a mesma caixa. Receber um aviso atualiza o sino imediatamente. Abrir a lista marca os avisos como lidos, preservando o comportamento da dev; a leitura local persiste mesmo se a gravação no servidor falhar.
- `NotificationBridge` inicia a captura após o login e a interrompe ao bloquear ou sair. Avisos recebidos, tocados e presentes na central do sistema entram na caixa; ao sair, o histórico do sistema também é limpo.
- A tarefa em segundo plano da spec 004 acrescenta avisos somente com sessão válida. Respostas de uma sessão encerrada são descartadas.
- As preferências existentes do Perfil continuam filtrando os avisos, mantendo pedidos de exame visíveis. As quatro abas e os links seguem no Expo Router. A lista abre Início, Documentos ou Histórico conforme `notificationTarget`.

### Tipos e limites

Push: `posicao_mudou`, `exame_pendente`, `documento_recebido`, `exame_em_analise` e `analise_concluida`, com `id`, `sentAt` e, opcionalmente, `widget`. O texto real e o motivo de uma mudança aprovada vêm do backend. Tipos de push desconhecidos são descartados.

A caixa persistida permite consultar avisos sem rede. A entrega real de push depende das credenciais APNs/FCM. O registro de token e as atualizações de widgets seguem a spec 004.

### Verificação

Preservar todos os testes da dev, incluindo a integração com a API real. Testar persistência, captura, aviso novo no sino existente, abertura dos Documentos completos, respeito às preferências e limpeza ao sair pelo Perfil. Verificar os tipos e gerar o bundle iOS com a entrada existente do Expo Router.
