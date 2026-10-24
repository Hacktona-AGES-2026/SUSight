# Tarefas: Widgets e avisos (parte do paciente, iPhone)

Plano: ./plan.md

Cada tarefa é pequena, verificável e vira um commit atômico. Os testes vêm antes do código (TDD).

- [x] 1. Development build: identidade do app, `scheme` `pulse` e perfis do EAS.
- [x] 2. Jest com `jest-expo` e scripts `typecheck` e `test`.
- [x] 3. Retrato do widget: testes e `buildWidgetSnapshot` (posição, anel, exames, "subiu X posições", privacidade, variante e data).
- [x] 4. Links: testes e `tabFromUrl` para `pulse://inicio` e `pulse://documentos`.
- [x] 5. Gravação: testes e `syncWidgets` e `clearWidgets` com armazenamento injetado.
- [x] 6. Extensão: `@bacons/apple-targets`, App Group e leitura do retrato em Swift.
- [x] 7. Widget pequeno em SwiftUI, nas duas variantes de cor.
- [x] 8. Widget médio em SwiftUI, nas duas variantes de cor.
- [ ] 9. App grava o retrato de demonstração ao abrir, até as specs 001 a 003 existirem.
- [ ] 10. README do app: como gerar o development build e testar os widgets no simulador. Tabela de critérios de aceite e testes, com justificativa para os que não têm teste automatizado.
