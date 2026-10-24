# Tarefas: Widgets e notificações do paciente (iOS)

Plano: ./plan.md

Cada tarefa é pequena, verificável e vira um commit atômico.

- [ ] 1. Trazer o esqueleto Expo para a `dev` (PR próprio) e configurar o development build com EAS.
- [ ] 2. Adicionar `@bacons/apple-targets`, App Group e uma extensão de widget vazia que compila no simulador.
- [ ] 3. Widget pequeno "Fila do SUS" em SwiftUI, lendo o resumo do App Group, com o estado "sem sessão".
- [ ] 4. Widget pequeno "Próximo passo", com deep link para a ação e o estado "Nada a fazer agora".
- [ ] 5. Widget médio "Minha jornada", com barra de progresso e data da última atualização.
- [ ] 6. Sincronização no app: montar o resumo, gravar no App Group, recarregar os widgets e limpar ao sair; dados de demonstração enquanto o backend não tem `/me/journey`.
- [ ] 7. Deep links `pulse://jornada` e `pulse://enviar-exame`.
- [ ] 8. Notificações: permissão com explicação, registro do token, texto de subida e de descida e toque abrindo "Minha jornada".
- [ ] 9. Testes: montagem do resumo (sem CNS, nome ou diagnóstico), textos da notificação e limpeza ao sair.
- [ ] 10. README: como gerar o development build e testar os widgets no simulador.
