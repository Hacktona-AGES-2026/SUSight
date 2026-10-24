# SUSight (app do paciente)

App em Expo (React Native) para o paciente acompanhar a fila do SUS.

## Como rodar

Pré-requisitos: Node 22 e npm.

```bash
npm install
npm test          # testes (Jest)
npm run typecheck # checagem de tipos
```

O app usa **development build**. O Expo Go não carrega a extensão de widgets.

- **Simulador do iPhone (macOS com Xcode):** `npm run ios`.
- **Sem Mac:** `npx eas build --profile development --platform ios`. O perfil gera um build para o simulador. É preciso uma conta Expo.

## Widgets do iPhone (spec 004)

Os widgets ficam numa extensão nativa em SwiftUI, em [targets/widgets](targets/widgets), criada pelo plugin `@bacons/apple-targets`. A pasta `ios/` é gerada pelo `npx expo prebuild` e não vai para o git. Mudanças nos widgets são feitas em `targets/widgets`.

Como os dados chegam ao widget:

1. O app monta um retrato pronto para exibir com `buildWidgetSnapshot` ([src/widgets/snapshot.ts](src/widgets/snapshot.ts)). Toda regra e todo texto ficam aqui, testados com Jest.
2. `syncWidgets` ([src/widgets/sync.ts](src/widgets/sync.ts)) grava o retrato no App Group `group.com.hacktonaages2026.pulse` e recarrega os widgets.
3. A extensão lê o retrato ([targets/widgets/Snapshot.swift](targets/widgets/Snapshot.swift)) e só desenha.

Enquanto as telas das specs 001 a 003 e o backend não existem, o app grava os dados de demonstração do Figma ao abrir ([src/widgets/demo.ts](src/widgets/demo.ts)).

### Testar no simulador

1. Gere e abra o development build no simulador do iPhone (iOS 17 ou mais novo).
2. Abra o app uma vez, para gravar o retrato.
3. Na tela inicial do simulador, toque e segure, toque em "+", procure "SUSight" e adicione os widgets pequeno e médio.
4. Toque no widget pequeno: o app abre em `pulse://inicio`. No médio, o anel abre `pulse://inicio` e a lista abre `pulse://documentos`.

Para testar num iPhone de verdade, é preciso uma conta Apple Developer e o `ios.appleTeamId` no `app.json`, por causa do App Group.

### Critérios de aceite e testes

| Critério (spec 004, paciente) | Como é verificado |
|---|---|
| Widget de posição nos tamanhos pequeno e médio | Manual, no simulador. A extensão é SwiftUI e não roda no Jest. |
| Dados coincidem com Início e Documentos | `snapshot.test.ts` e `demo.test.ts`. As telas ainda não existem; quando existirem, devem usar o mesmo `buildWidgetSnapshot`. |
| Atualizam após mudança aprovada ou exame pedido, sem abrir o app | **Pendente.** Depende do push do backend (spec 002), que acorda o app para chamar `syncWidgets`. |
| Tocar abre o app na tela correta, sem ações | `links.test.ts` para os links. O toque no widget é verificado no simulador. |
| Notificações de posição, exame em análise, exame faltando e documento recebido | **Fora desta implementação.** São as notificações da spec 002 e dependem do backend. |
| Sem conexão, mostram a última informação com data | `snapshot.test.ts` (data da informação). A troca pela data depois de um dia fica em `Snapshot.swift` (`isStale`) e é verificada no simulador. |
| "Subiu X posições" só quando subiu | `snapshot.test.ts`. |
| Aparelho bloqueado com Face ID: posição escondida | `snapshot.test.ts` (`hideWhenLocked`). O iOS esconde com `.privacySensitive()`; verificado no aparelho bloqueado. |
| Tamanho de texto do sistema, alvos de 44 pt e contraste, nas duas variantes | Manual. Os textos usam os estilos do sistema, que seguem o tamanho escolhido pelo paciente. As cores são as do Figma. |
| Português do Brasil, sem alarme e sem prometer data de cirurgia | `snapshot.test.ts`. |
