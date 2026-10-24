# Tarefas: Login do paciente

Plano: ./plan.md

Cada tarefa é pequena, verificável e vira um commit atômico. Cada tarefa começa pelo teste que falha (red), depois o código que o faz passar (green).

- [ ] 1. Teste: `isValidCpf` aceita CPF válido e recusa dígitos verificadores errados. Implementar.
- [ ] 2. Teste: sem sessão, a abertura leva ao login.
- [ ] 3. Teste: CPF inválido não envia código; CPF não cadastrado mostra mensagem genérica.
- [ ] 4. Teste: código certo leva ao Início; código errado mostra mensagem; cinco erros bloqueiam por 5 minutos.
- [ ] 5. Teste: o reenvio só fica disponível depois da contagem.
- [ ] 6. Teste: a sessão persiste e expira depois de 30 minutos sem uso.
- [ ] 7. Teste: "Entrar com gov.br" orienta a usar o CPF.
