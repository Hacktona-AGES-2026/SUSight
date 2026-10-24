# Plano: Widgets e avisos (parte do paciente, iPhone)

Spec: ./spec.md
Status: em revisão

## Abordagem

Este plano cobre a parte do paciente. A parte do médico é implementada no SUSight-Web.

Widgets de iPhone só existem como extensão nativa (WidgetKit, em SwiftUI). O app Pulse é Expo, então a extensão é criada pelo config plugin `@bacons/apple-targets` e o app passa a usar development build. Toda a regra de negócio fica em TypeScript, no app, e é testada com Jest: posição, anel, exames, "subiu X posições", textos e privacidade. O app monta um retrato pronto para exibir e grava esse retrato num App Group. A extensão só lê o retrato e desenha. Assim, o Swift não tem regra para testar.

## Dados e interfaces

- **Retrato do widget (`app/src/widgets/snapshot.ts`):** `buildWidgetSnapshot(input)` devolve `{ version, signedIn, positionText, ringProgress, pendingText, exams[], riseText, hideWhenLocked, variant, updatedAtText, updatedAt }`.
  - `exams` traz até 3 exames, com os pendentes primeiro e a situação da spec 001 (Pendente, Recebido, Em análise).
  - `riseText` só existe quando a posição subiu no mês.
  - `ringProgress` é `(total - posição + 1) / total`: quanto mais perto da frente, mais cheio o anel.
- **Gravação (`app/src/widgets/sync.ts`):** `syncWidgets(snapshot, storage)` grava o JSON na chave `widget_snapshot` do App Group `group.com.hacktonaages2026.pulse` e recarrega os widgets. `clearWidgets(storage)` grava o estado "sem sessão" ao sair. O armazenamento é injetado; no app, é o `ExtensionStorage` do `@bacons/apple-targets`.
- **Links (`app/src/widgets/links.ts`):** `pulse://inicio` e `pulse://documentos`, e `tabFromUrl(url)`, que diz qual aba abrir. A navegação por abas é da spec 002 e vai usar essa função.
- **Extensão (`app/targets/widgets/`):**
  - `expo-target.config.js`: tipo `widget`, mesmo App Group do app.
  - `Snapshot.swift`: decodifica o JSON.
  - `PositionRing.swift`: o anel.
  - `SmallWidget.swift`: anel, "Sua posição na fila" e exames pendentes. Abre o Início.
  - `MediumWidget.swift`: anel, "Sua posição", lista de exames e "Subiu X posições este mês". O anel abre o Início e a lista abre Documentos.
  - `PulseWidgets.swift`: o `WidgetBundle`.
- **Dados de entrada:** posição, total, posição de um mês atrás, exames e preferência de Face ID. Enquanto as telas das specs 001 a 003 e o backend não existem, a tela inicial do app grava um retrato de demonstração.

## Decisões

| Decisão | Alternativas consideradas | Motivo |
|---|---|---|
| WidgetKit via `@bacons/apple-targets` | Bibliotecas que desenham widgets em JS; editar o Xcode à mão | Widgets de iPhone só existem nativos. O plugin mantém o projeto Expo gerenciado e versiona a extensão no repositório. |
| Regras e textos em TypeScript; Swift só desenha | Calcular no Swift | Dá para testar tudo com Jest (TDD) e manter os textos num lugar só. |
| Situações dos exames: Pendente, Recebido, Em análise | "Enviado", como no Figma | A spec 004 manda usar as situações da spec 001. A diferença está em "Questões em aberto". |
| Fontes do sistema por estilo (`.title`, `.headline`, `.caption`) | Tamanhos fixos do Figma | Seguem o tamanho de texto do sistema, como pede a spec. Os estilos ficam muito próximos dos tamanhos do Figma. |
| Posição escondida com `.privacySensitive()` quando o Face ID está ativo | Esconder sempre | O iOS esconde só com o aparelho bloqueado. Com o aparelho desbloqueado, o paciente vê a posição. |
| Variante de cor gravada no retrato (`padrao` ou `invertido`) | Duas extensões | Atende às duas variantes sem duplicar código. Quem escolhe a variante continua em aberto na spec. |
| Notificações fora deste plano | Implementar aqui | Os avisos são os da spec 002 e dependem do backend. Este plano só garante que o toque abre a aba certa. |

## Riscos

- **Esta máquina é Linux.** A extensão Swift não é compilada nem testada aqui. Mitigação: as regras ficam testadas em TypeScript. Compilar e conferir no simulador exige macOS com Xcode ou EAS Build.
- **App Group fora do simulador exige conta Apple Developer.** Mitigação: testar primeiro no simulador.
- **O backend não fornece posição, histórico nem exames.** Mitigação: retrato de demonstração até as specs 001 e 002 e o backend existirem.
- **O "subiu X posições" depende de histórico de posição**, que está em aberto na spec. Mitigação: sem histórico, a linha não aparece.
