# Spec: Posição na fila e notificações

Issue: #11
Status: rascunho

## Contexto

O paciente quer saber onde está na fila de cirurgia e ser avisado quando algo muda, sem precisar abrir o app para conferir. A posição exibida vem da fila oficial do SUS, que só é atualizada depois que o médico aprova a proposta da IA. Propostas em análise ou em revisão não alteram o que o paciente vê.

## Comportamento esperado

1. A tela inicial mostra a posição atual do paciente na fila, a prioridade validada pela regulação (Baixa, Moderada ou Alta) e a data da última atualização.
2. A tela mostra o próximo passo em linguagem simples, de acordo com a situação do paciente:
   - "Seu documento está em análise";
   - "O médico está revisando";
   - "O médico pediu mais informações" (com atalho para enviar documento, spec 001);
   - "Sua posição foi atualizada".
3. Quando o médico aprova uma nova fila e a posição do paciente muda, o paciente recebe uma notificação com a nova posição e um resumo legível do motivo da mudança.
4. O paciente também é notificado quando: o documento foi recebido, o médico pediu informações, ou a análise terminou sem mudança de posição.
5. Se o médico rejeitar a proposta, o paciente não recebe aviso de mudança. A reavaliação da IA é interna e só gera notificação se resultar em nova fila aprovada.
6. Ao tocar na notificação, o app abre a tela de posição já mostrando a atualização.
7. Sem conexão, o app mostra a última posição conhecida com a data e avisa que ela pode estar desatualizada.
8. Posição nunca é exibida como garantia de data de cirurgia.

## Critérios de aceite

- [ ] A posição exibida corresponde à fila oficial aprovada e nunca a uma proposta pendente.
- [ ] A tela mostra prioridade, data da última atualização e o próximo passo.
- [ ] Aprovação do médico que altera a posição gera notificação com nova posição e motivo em linguagem simples.
- [ ] Recebimento do documento e pedido de informações do médico geram notificação.
- [ ] Rejeição pelo médico não gera notificação de mudança de posição.
- [ ] Tocar na notificação abre a tela correta.
- [ ] Sem conexão, o app mostra a última posição conhecida com aviso de que pode estar desatualizada.
- [ ] O texto não promete data de cirurgia nem usa tom de alarme.
- [ ] O paciente pode desativar tipos de notificação (preferências na spec 004).

## Fora do escopo

- Cálculo da posição e das regras de equidade (backend, issue #6).
- Revisão e decisão do médico (Pulse Clinical).
- Widgets (spec 005).

## Questões em aberto

- Qual detalhe do motivo da mudança o paciente pode ver, considerando LGPD e explicabilidade sem expor dados de outros pacientes?
- A posição é absoluta ("12º") ou por faixa, e há mostrar o tamanho total da fila?
- Notificação por push apenas, ou também por SMS ou e-mail?
- Qual a frequência máxima de notificações para evitar excesso de avisos?
