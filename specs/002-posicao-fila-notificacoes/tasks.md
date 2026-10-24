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

- [x] Reaplicar somente os commits de notificações sobre a dev atual, incluindo a integração com o backend.
- [x] Preservar os fluxos e os testes existentes de login, Face ID, Início, Documentos, Histórico, Perfil e widgets.
- [x] Validar e persistir avisos conhecidos, sem duplicar identificadores.
- [x] Capturar avisos recebidos, tocados e em segundo plano com a sessão existente.
- [x] Integrar a caixa ao sino e à rota de notificações existentes, respeitando as preferências.
- [x] Reutilizar a camada de API da dev e os endpoints reais de notificações.
- [x] Limpar a caixa ao sair e descartar respostas de uma sessão encerrada.
- [x] Manter as quatro abas, os links pelo Expo Router e o ícone da dev.
- [x] Verificação automatizada: 168 testes, checagem de tipos e bundle iOS.
