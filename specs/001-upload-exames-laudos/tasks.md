# Tarefas: Documentos, upload de exames e laudos

Plano: ./plan.md

Cada tarefa é pequena, verificável e vira um commit atômico. Cada tarefa começa pelo teste que falha (red), depois o código que o faz passar (green).

- [ ] 1. Teste: `checkFile` aceita PDF, JPG e PNG até 20 MB e recusa o resto com mensagem em português. Implementar.
- [ ] 2. Teste: a lista mostra nome, tipo, data e as situações Pendente, Recebido e Em análise, do mais recente ao mais antigo; vazia mostra o estado explicativo.
- [ ] 3. Teste: "Adicionar documento" abre a folha com câmera, biblioteca e Arquivos.
- [ ] 4. Teste: "Novo documento" mostra nome, origem, tamanho e legibilidade, o tipo começa em Exame e não há campo de observações.
- [ ] 5. Teste: enviar volta à lista com "Documento recebido" e o item como Recebido.
- [ ] 6. Teste: falha no envio mostra a mensagem e permite tentar de novo sem perder arquivo e tipo.
- [ ] 7. Teste: um exame "Pendente" abre o envio daquele exame e vira Recebido depois do envio.
