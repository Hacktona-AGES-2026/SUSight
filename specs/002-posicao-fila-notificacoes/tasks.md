# Tarefas: Início, posição na fila e notificações

Plano: ./plan.md

Cada tarefa é pequena, verificável e vira um commit atômico. Cada tarefa começa pelo teste que falha (red), depois o código que o faz passar (green).

- [x] 1. Criar o app Expo com expo-router, jest-expo e Testing Library.
- [x] 2. Tokens do Figma, ícones e componentes do design system.
- [x] 3. Teste: a abertura mostra nome, lema e a nota de validação profissional. Implementar a abertura.
- [x] 4. Teste: o Início mostra posição, total, especialidade, cidade, data e o aviso de que não é previsão de data. Implementar o cartão e o anel.
- [x] 5. Teste: "Situação atual" mostra prioridade com data, último passo, tempo de espera e última atualização clínica; o atalho abre o envio de documento e não há relato de dor.
- [x] 6. Teste: "Acontecimentos recentes" em ordem cronológica e "Ver histórico completo" abre o Histórico.
- [x] 7. Teste: o sino mostra o ponto de novo e abre as notificações; tocar numa notificação abre a tela certa.
- [x] 8. Teste: sem conexão, o Início mostra o último dado com o aviso; sem dado, mostra o erro com "Tentar de novo".
- [x] 9. Teste: as quatro abas navegam e a ativa fica destacada.

## Complemento: notificações persistentes

Integrar à navegação e às telas existentes da `dev`.


Plano: ./plan.md

Cada tarefa é pequena, verificável e vira um commit atômico. Os testes vêm antes do código (TDD).

- [ ] 1. Tipo `analise_concluida`: testes e toque abrindo o Início; script de push de teste com `id`, `sentAt`, o motivo na mudança de posição e o novo tipo.
- [ ] 2. Caixa: testes e `parseNotification`, `mergeInbox`, `markRead`, `unreadCount`, `markerFor` e `formatShortDate`, descartando tipos desconhecidos.
- [ ] 3. Armazenamento da caixa no AsyncStorage, com aviso de mudança para as telas.
- [ ] 4. Captura: aviso com o app aberto, toque, avisos na central ao abrir e tarefa em segundo plano entram na caixa.
- [ ] 5. Caixa vinda da API (`GET /me/notifications`) e demonstração sem backend.
- [ ] 6. Tokens do Figma, ícones e `react-native-svg`.
- [ ] 7. Barra de abas e `AppShell`: testes, quatro abas, aba ativa destacada e aviso ou widget abrindo a aba certa.
- [ ] 8. Sino no Início: testes, ponto de novo e abertura das notificações.
- [ ] 9. Tela de notificações: testes, lista com ponto, título, texto e data, toque marcando como lido e abrindo a tela do aviso, lista vazia e leitor de tela.
- [ ] 10. README do app: como testar as notificações e tabela de critérios e testes.
