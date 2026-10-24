# Tarefas: Widgets e avisos (parte do paciente, iPhone e Android)

Plano: ./plan.md

Cada tarefa é pequena, verificável e vira um commit atômico. Os testes vêm antes do código (TDD).

- [x] 1. Development build: identidade do app, `scheme` `pulse` e perfis do EAS.
- [x] 2. Jest com `jest-expo` e scripts `typecheck` e `test`.
- [x] 3. Retrato do widget: testes e `buildWidgetSnapshot` (posição, anel, exames, "subiu X posições", privacidade, variante e data).
- [x] 4. Links: testes e `tabFromUrl` para `pulse://inicio` e `pulse://documentos`.
- [x] 5. Gravação: testes e `syncWidgets` e `clearWidgets` com armazenamento injetado.
- [x] 6. Extensão iOS: `@bacons/apple-targets`, App Group e leitura do retrato em Swift.
- [x] 7. Widget pequeno do iPhone, nas duas variantes de cor.
- [x] 8. Widget médio do iPhone, nas duas variantes de cor.
- [x] 9. App grava o retrato de demonstração ao abrir, até as specs 001 a 003 existirem.
- [x] 10. README do app: development build, teste dos widgets no simulador e tabela de critérios e testes.
- [ ] 11. Retrato: testes e campos `nextExam`, `week` e `accessibilityText`.
- [ ] 12. VoiceOver e Dynamic Type nos widgets do iPhone: rótulo único com `accessibilityText`, anel e marcadores escondidos do leitor de tela.
- [ ] 13. Dados remotos: testes e `parseWidgetPayload` para o payload do push e de `GET /me/widget`.
- [ ] 14. Widgets Android: `react-native-android-widget`, widget largo, "Próximo exame" e "Esta semana", com TalkBack e fonte em `sp`.
- [ ] 15. `refreshAllWidgets`: testes e atualização do iPhone e do Android a partir do mesmo retrato.
- [ ] 16. Push: testes e permissão com explicação, registro do token, canal Android e toque abrindo a aba certa.
- [ ] 17. Segundo plano: testes e tarefas de push e periódica, com token no `expo-secure-store`.
- [ ] 18. Script de push de teste para validar sem o backend.
- [ ] 19. README: push no EAS (APNs e FCM), teste nos dois sistemas e tabela de critérios e testes atualizada.
