# Spec: Atualizar situação

Issue: #12
Status: rascunho

## Contexto

A condição do paciente pode piorar durante a espera. Deterioração e dor são critérios da fila. Nesta tela o paciente relata como está (dor, mobilidade, texto ou áudio) e esse relato entra no ciclo da IA como informação complementar. Relatos do paciente não substituem exames: sozinhos nunca alteram a fila, apenas alimentam a análise que o médico revisa.

## Telas (Figma Hackathona-2026)

Ainda não há tela própria de "Atualizar situação". Só existe o ponto de entrada: o cartão "Atualizar minha situação" na tela de Início (nó 41-111), com a nota "cerca de 2 minutos, não é preciso ter exames novos". A tela precisa ser desenhada antes da implementação.

## Comportamento esperado

1. O paciente abre "Atualizar situação" e informa:
   - nível de dor (escala simples);
   - mobilidade (por exemplo, consegue andar sozinho, com ajuda, não consegue);
   - um relato livre, por texto ou por áudio gravado no app.
2. Antes de enviar, o paciente revisa o que informou e pode corrigir. Para áudio, pode ouvir e regravar.
3. Ao enviar, o app confirma o recebimento e explica que o relato será considerado junto com os exames e revisado por um médico. O app não diz que a posição vai mudar.
4. Quando o relato indicar sinais de urgência (por exemplo, dor muito intensa ou perda súbita de mobilidade), o app orienta com calma a procurar a UPA ou ligar para o SAMU 192, sem fazer diagnóstico e sem substituir o atendimento de urgência. Essa orientação também aparece de forma fixa e visível na tela.
5. O relato enviado aparece no histórico (spec 004) com a situação "em análise".
6. Se o médico pedir informações (spec 002), o paciente chega a esta tela pelo atalho.
7. Falha de envio permite tentar de novo sem perder o que foi preenchido ou gravado.

## Critérios de aceite

- [ ] O paciente informa dor, mobilidade e relato por texto ou por áudio.
- [ ] Há revisão antes do envio, com possibilidade de corrigir ou regravar o áudio.
- [ ] Após o envio, o app confirma o recebimento sem prometer mudança de posição.
- [ ] A orientação de urgência (UPA ou SAMU 192) aparece de forma fixa e também em resposta a sinais de urgência.
- [ ] O app não faz diagnóstico nem interpreta os sintomas.
- [ ] O relato nunca altera a posição por si só; é registrado como informação complementar.
- [ ] Permissão de microfone é pedida com explicação do motivo, e a tela funciona por texto se for negada.
- [ ] Falha de envio não perde o conteúdo preenchido.
- [ ] Textos em português do Brasil, simples e sem alarme.

## Fora do escopo

- Triagem clínica ou classificação de gravidade.
- Chatbot ou conversa com a IA.
- Interpretação do relato (backend, issue #7).

## Questões em aberto

- Qual a escala de dor (0 a 10, faces) e quais as opções de mobilidade?
- Quais respostas disparam a orientação de urgência, e quem valida esses limites?
- Qual a duração máxima do áudio e ele é transcrito para o médico?
- Existe limite de quantas atualizações o paciente pode enviar por dia?
