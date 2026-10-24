# Plano: Widgets e notificações do paciente (iOS)

Spec: ./spec.md
Status: em revisão

## Abordagem

O app Pulse é Expo (React Native). Widgets de iOS só existem como extensão nativa (WidgetKit, em SwiftUI), então o app passa a usar development build em vez do Expo Go. A extensão é criada e mantida pelo config plugin `@bacons/apple-targets`, sem editar o projeto do Xcode à mão. O app em React Native grava um resumo da jornada num App Group compartilhado com a extensão e pede para os widgets recarregarem. As notificações usam `expo-notifications`: o app registra o token de push no backend, e o backend envia pelo serviço de push do Expo quando uma fila é aprovada.

## Dados e interfaces

- **Resumo compartilhado (App Group `group.<bundle>.pulse`):** JSON `{ signedIn, position, total, specialty, requestNumber, status, procedure, progress, nextStep: { title, actionLabel, deepLink } | null, updatedAt }`, gravado pelo app com `ExtensionStorage` (de `@bacons/apple-targets`).
- **Extensão (`targets/widgets/`):** SwiftUI com três widgets: `QueuePositionWidget` (pequeno), `NextStepWidget` (pequeno) e `JourneyWidget` (médio). Um `TimelineProvider` lê o App Group. Cada widget abre um deep link: `pulse://jornada` ou o `deepLink` do próximo passo.
- **App (`app/`):**
  - `src/widgets/sync.ts`: monta o resumo, grava no App Group e chama `ExtensionStorage.reloadWidget()`. É chamado ao entrar, ao abrir o app, ao receber notificação e ao sair (que limpa os dados).
  - `src/notifications/`: permissão com explicação, registro do token e tratamento do toque, que abre "Minha jornada".
  - Deep links `pulse://jornada` e `pulse://enviar-exame` no `app.json`.
- **Backend (SUSight-Backend), pedido à equipe:**
  - `GET /me/journey`: resumo acima, sem CNS nem nome.
  - `POST /me/push-token`: registra o token do Expo.
  - Envio do push "position_changed" quando uma aprovação muda a posição, com `{ from, to, specialty, city }`.

## Decisões

| Decisão | Alternativas consideradas | Motivo |
|---|---|---|
| WidgetKit em SwiftUI via `@bacons/apple-targets` | Bibliotecas que desenham widgets em JS; ejetar para o projeto nativo | Widgets de iOS só existem nativos. O plugin mantém o projeto Expo gerenciado e versiona a extensão no repositório. |
| Dados por App Group, gravados pelo app | Widget chamando a API sozinho | O widget não guarda o token de sessão e funciona sem rede com a última informação. |
| `expo-notifications` com o serviço de push do Expo | APNs direto | Menos configuração na hackathon; troca para APNs direto depois sem mudar o app. |
| Development build e EAS Build | Expo Go | O Expo Go não carrega extensões nativas. |
| Textos e dados sem CNS, nome ou diagnóstico | Mostrar tudo como no app | A tela inicial é visível para outras pessoas (constituição, item 6). |

## Riscos

- **O esqueleto Expo ainda não está na `dev`.** Ele só existe na branch `chore/sdd-setup` (commit "Scaffold Expo React Native app"). Mitigação: abrir um PR só com ele antes de começar.
- **Compilar a extensão exige macOS com Xcode ou EAS Build, e assinar com App Group exige conta Apple Developer.** Mitigação: definir quem tem Mac ou conta EAS. Os widgets podem ser testados no simulador do iOS sem conta paga.
- **O backend ainda não tem as rotas e o envio de push.** Mitigação: o app usa dados de demonstração para o resumo, e o push é testado com a ferramenta de envio do Expo.
- **O iOS limita quantas vezes o widget atualiza.** Mitigação: a atualização principal vem do app e das notificações, não do relógio.
