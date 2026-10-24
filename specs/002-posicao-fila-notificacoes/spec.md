# Spec: Início: abertura, posição na fila e notificações

Issue: #11
Status: rascunho

## Contexto

O paciente quer saber onde está na fila de cirurgia, por que está nela e o que acontece agora, e ser avisado quando algo muda. A posição exibida vem da fila oficial do SUS, que só é atualizada depois que o médico aprova a proposta da IA. Propostas em análise ou em revisão não alteram o que o paciente vê.

Esta spec também cobre a abertura do app e a navegação principal por abas (Início, Documentos, Histórico, Perfil), por serem a base das demais telas.

## Telas (Figma Hackathona-2026, seção Paciente · Abertura e início)

| Tela | Nó | O que mostra |
|---|---|---|
| Abertura | 41-4 | Logo, "SUSight", "Sua jornada no SUS, com clareza." e a nota de que toda decisão sobre a fila é validada por um profissional de saúde |
| Início (topo) | 41-21 | Saudação, sino de notificações, cartão da posição, cartão da cirurgia, "Por que estou na fila" |
| Início (rolagem) | 41-111 | Motivo registrado, situação atual, atalhos de ação e acontecimentos recentes |

## Comportamento esperado

**Abertura**

1. Ao abrir o app, aparece a tela de abertura com a mensagem de que toda decisão sobre a fila é validada por um profissional de saúde.

**Início, topo**

2. A saudação usa o nome do paciente. O sino abre as notificações e mostra um ponto quando há avisos novos.
3. O cartão principal mostra a posição ("42ª de 118 pessoas"), a especialidade e a cidade da fila ("Ortopedia · Niterói"), um anel de progresso e a data da última atualização. O texto explica que a posição pode subir ou descer quando outros pacientes são reavaliados e que **não é uma previsão de data de cirurgia**.
4. O cartão da cirurgia mostra a situação ("Aguardando cirurgia"), o número do pedido, o procedimento e a especialidade.
5. "Por que estou na fila" mostra quando e por quem o paciente foi encaminhado (data, UBS e profissional).

**Início, rolagem**

6. "Motivo registrado" mostra o motivo constante do encaminhamento, com a orientação de procurar a UBS ou enviar uma atualização se algo não estiver certo. O app apenas exibe o que está registrado e não faz diagnóstico.
7. "Situação atual" lista: prioridade validada pela regulação (Baixa, Moderada ou Alta) com a data de validação; o último passo e se está pendente; tempo de espera acumulado; e a última atualização clínica, com há quantos dias.
8. Dois atalhos de ação: "Enviar exame ou laudo" (abre o fluxo da spec 001) e "Atualizar minha situação" (abre o fluxo da spec 003, com a nota "cerca de 2 minutos, não é preciso ter exames novos").
9. "Acontecimentos recentes" mostra os últimos eventos (documento recebido, pedido de informação, prioridade validada, reavaliação concluída) com data. "Ver histórico completo" abre a aba Histórico (spec 004).

**Notificações**

10. O paciente é notificado quando: o documento foi recebido; o médico pediu informação ou confirmação; o médico aprovou uma nova fila e a posição mudou (com a nova posição e o motivo em linguagem simples); ou a análise terminou sem mudança de posição.
11. Se o médico rejeitar a proposta, o paciente não recebe aviso de mudança. A reavaliação da IA é interna e só gera notificação se resultar em nova fila aprovada.
12. Tocar na notificação abre a tela correspondente.
13. Sem conexão, o app mostra a última posição conhecida com a data e avisa que pode estar desatualizada.

**Navegação**

14. A barra inferior tem quatro abas: Início, Documentos, Histórico e Perfil. A aba ativa fica destacada.

## Critérios de aceite

- [ ] A tela de abertura mostra o nome, o lema e a nota sobre validação profissional.
- [ ] O início mostra posição, total da fila, especialidade, cidade e data da última atualização.
- [ ] O texto do cartão da posição deixa claro que não é previsão de data de cirurgia.
- [ ] A posição exibida corresponde à fila oficial aprovada e nunca a uma proposta pendente.
- [ ] "Situação atual" mostra prioridade com data, último passo, tempo de espera e última atualização clínica.
- [ ] Os atalhos levam aos fluxos das specs 001 e 003.
- [ ] "Acontecimentos recentes" lista eventos em ordem cronológica e "Ver histórico completo" abre o histórico.
- [ ] As quatro abas funcionam e a aba ativa é destacada.
- [ ] Aprovação do médico que altera a posição gera notificação com nova posição e motivo em linguagem simples.
- [ ] Recebimento do documento e pedido de informações geram notificação.
- [ ] Rejeição pelo médico não gera notificação de mudança de posição.
- [ ] Sem conexão, o app mostra a última posição conhecida com aviso de desatualização.
- [ ] O sino mostra o ponto de aviso novo e abre as notificações.
- [ ] Textos em português do Brasil, sem alarme e sem prometer data de cirurgia.
- [ ] O paciente pode desativar tipos de notificação (spec 004).

## Fora do escopo

- Cálculo da posição e das regras de equidade (backend, issue #6).
- Revisão e decisão do médico (Pulse Clinical).
- Widgets (spec 005).
- Login do paciente.

## Questões em aberto

- Não há tela de notificações no Figma. Será uma lista dentro do app aberta pelo sino? Precisa de design.
- O design mostra o total da fila (118) e a posição exata. Isso é aceitável para LGPD e para a equidade, já que expõe o tamanho da lista? Confirmar com a equipe.
- O que significa o anel de progresso: proporção da posição sobre o total ou avanço desde a entrada na fila?
- "Motivo registrado" traz termos clínicos (por exemplo, osteoartrose). Isso vem do encaminhamento e será exibido como está?
- Notificação por push apenas, ou também por SMS ou e-mail? Qual a frequência máxima?
- Quais eventos entram em "Acontecimentos recentes" e há detalhe do motivo da mudança de posição para o paciente?
