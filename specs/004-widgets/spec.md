# Spec: Widgets e avisos (paciente e médico)

Issue: #14
Status: rascunho

## Contexto

Widgets e avisos dão acesso rápido ao que importa sem abrir o aplicativo. Esta spec cobre dois lados:

- **Paciente (iPhone e Android):** acompanhar a posição na fila e os exames pendentes e receber avisos na tela de bloqueio, sem precisar abrir o app.
- **Médico (Windows):** ver quantas propostas esperam revisão e receber avisos de propostas para aprovar. O médico usa o SUSight Clínica, que fica em outro repositório (SUSight-Web), então a parte do médico aqui é a referência do comportamento e do design, e a implementação acontece lá (SUSight-Web, spec 010).

Os widgets do paciente mostram a mesma informação das telas do app (specs 001 e 002) e herdam suas regras: só a fila oficial aprovada é exibida. Nada de proposta da IA aparece para o paciente.

## Telas (Figma Hackathona-2026)

### Paciente

Escopo do MVP: as telas iOS e Android. Base: `https://www.figma.com/design/iy1iFYNgXDrqylPa0JdGrr/Hackathona-2026?node-id=<nó>&m=dev`.

**iOS (seção 96-2)**

| Tela | Nó | O que mostra |
|---|---|---|
| Widget pequeno | 101-85 | Anel com a posição ("42ª"), "Sua posição na fila" e "2 exames pendentes" |
| Widget médio | 101-343 | Anel com a posição, lista de exames com situação (Pendente, Em análise, Enviado) e "Subiu 11 posições este mês" |
| Tela de bloqueio | 101-583 | Três notificações recolhidas do app |

**Android (seção 97-85)**

| Tela | Nó | O que mostra |
|---|---|---|
| Tela inicial | 102-4561 | Widget largo (anel, posição e exames com situação) e dois widgets pequenos: "Próximo exame" ("Enviar até sexta") e "Esta semana" ("↑ 3 posições") |
| Notificações | 102-4610 | "Sua posição mudou", "Analisando seu exame" (com indicador de progresso), "Falta um exame" e "Documento recebido" |

**Variante com cores invertidas, fundo rosa (opção 106-675)**

| Tela | Nó |
|---|---|
| iOS widget pequeno invertido | 106-676 |
| iOS widget médio invertido | 106-838 |
| Android tela inicial invertida | 106-997 |
| Android notificações invertidas | 106-1068 |

**Componentes e seções**

| Item | Nó |
|---|---|
| Ícone do app SUSight | 96-2590 |
| Rótulos de seção: Paciente iOS, Paciente Android | 96-2, 97-85 |

### Médico (Windows)

| Tela | Nó | O que mostra |
|---|---|---|
| Painel de widgets e notificações do Windows 11 | 98-97 | Widget "Aprovações" ("3 propostas para revisar", com botão), widget "Envio rápido" ("Enviar documento") e três notificações do "SUSight Clínica" |
| Rótulo de seção | 98-96 | Médico Windows |

Notificações do médico no painel: "Nova proposta para revisão" (nome da paciente e dados da proposta, com botão), "Fila aprovada e atualizada" ("3 pacientes foram avisados") e "Paciente respondeu ao pedido" (nome da paciente que enviou o exame, com botão).

Todos os nós foram lidos só pela estrutura (nomes e textos), sem captura de tela. O conteúdo das três notificações da tela de bloqueio iOS (101-583) não aparece na estrutura e foi assumido igual ao do Android. Os textos das notificações do médico aparecem truncados na estrutura.

## Comportamento esperado

### Paciente (iPhone)

1. O paciente adiciona o widget de posição na fila no iPhone ou no Android. Ele mostra a posição atual em um anel e, conforme o tamanho, a quantidade ou a lista de exames pendentes, e o quanto a posição subiu no período.
2. No Android, além do widget largo com o anel e os exames, há dois widgets pequenos: "Próximo exame" (o exame pendente com o prazo, ex.: "Ressonância · Enviar até sexta") e "Esta semana" (ex.: "↑ 3 posições"). Os widgets são nativos de cada sistema.
3. Os widgets são só de visualização rápida. Tocar neles apenas abre o app: no Início (posição) ou na aba Documentos (exames).
4. Os widgets se atualizam quando a posição muda ou quando um exame é pedido, recebido ou entra em análise, sem o paciente abrir o app. A atualização chega por push notification e, como reserva, o sistema atualiza os widgets de tempos em tempos em segundo plano.
5. Os exames na lista usam as situações da spec 001 (Pendente, Recebido, Em análise).
6. Avisos por push notification na tela de bloqueio e na central de notificações, no iPhone e no Android: posição mudou (com a nova posição), exame em análise, falta um exame (com o nome do exame) e documento recebido. No Android, "Analisando seu exame" mostra um indicador de progresso. São as mesmas notificações da spec 002 e respeitam a chave de avisos da spec 003. O aviso de exame pedido sempre chega.
7. Variação de posição ("subiu X posições") só é mostrada quando a posição de fato subiu. Quando desce ou não muda, o widget mostra só a posição atual, sem alarme.
8. Sem dados ou sem conexão, o widget mostra a última informação conhecida com a data, ou orienta a abrir o app.
9. Com Face ID ativado (spec 003), o widget e as notificações mostram uma versão sem a posição exata quando o aparelho está bloqueado.
10. Acessibilidade: os widgets seguem o tamanho de texto do sistema (Dynamic Type no iPhone, tamanho da fonte no Android) e têm contraste adequado nas duas variantes de cor. Com VoiceOver (iPhone) ou TalkBack (Android), cada widget é lido como uma frase completa (ex.: "Sua posição na fila: 42ª. 1 exame pendente. Subiu 11 posições este mês."), sem ler elementos decorativos como o anel ou os marcadores.

### Médico (Windows)

11. O widget "Aprovações" mostra quantas propostas de nova fila esperam revisão. O botão abre o Pulse Clinical na lista de revisões pendentes.
12. O médico é avisado quando: chega uma nova proposta para revisão; o paciente responde a um pedido de exame (enviou o documento); e uma fila aprovada foi aplicada, informando quantos pacientes foram avisados.
13. Tocar na notificação ou no botão abre a revisão correspondente. O aviso nunca aprova nada sozinho: a decisão acontece só dentro do Pulse Clinical, com o registro de nome, data e hora (constituição, princípios 1 e 2).
14. Os avisos mostram o mínimo de dados pessoais necessários para identificar a proposta, respeitando a LGPD.
15. O widget "Envio rápido" ("Enviar documento") do painel leva ao envio de um documento. Ver questões em aberto.

## Critérios de aceite

### Paciente

- [ ] Existe widget de posição na fila no iPhone, nos tamanhos pequeno e médio.
- [ ] Existem no Android o widget largo e os widgets "Próximo exame" e "Esta semana".
- [ ] Os dados exibidos coincidem com as telas de Início e Documentos do app.
- [ ] Os widgets atualizam após mudança aprovada ou novo exame pedido, sem abrir o app, no iPhone e no Android.
- [ ] Tocar abre o app na tela correta e o widget não executa ações.
- [ ] As push notifications de posição, exame em análise, exame faltando e documento recebido chegam ao iPhone e ao Android.
- [ ] Sem conexão, os widgets mostram a última informação com data.
- [ ] "Subiu X posições" só aparece quando a posição subiu.
- [ ] Com o aparelho bloqueado e Face ID ativo, a posição exata não é exibida.
- [ ] Respeitam tamanho de texto do sistema (Dynamic Type e fonte do Android), alvos de toque de 44 pt e contraste (issue #21), nas duas variantes de cor.
- [ ] Com VoiceOver e TalkBack, cada widget é lido como uma frase completa, sem elementos decorativos.
- [ ] Textos em português do Brasil, sem alarme e sem prometer data de cirurgia.

### Médico

- [ ] O widget "Aprovações" mostra a quantidade de propostas pendentes e abre as revisões pendentes.
- [ ] O médico recebe aviso de nova proposta, de resposta do paciente a um pedido de exame e de fila aprovada aplicada.
- [ ] Nenhum widget ou aviso aprova ou rejeita uma proposta.
- [ ] Os avisos não expõem dados sensíveis além do necessário para identificar a proposta.

## Testes (TDD)

Os testes vêm antes do código. Cada critério de aceite acima vira pelo menos um teste automatizado que falha primeiro (red), e a implementação só termina quando todos passam (green). Critério que não puder ser testado automaticamente leva uma justificativa escrita. Testes de componente e de fluxo do app (issue #26).

## Fora do escopo

- Widgets interativos com ações (enviar documento).
- Widgets interativos do médico: aprovar ou rejeitar direto do widget.
- Widgets do paciente no Windows e do médico no iPhone ou Android.

## Questões em aberto

### Paciente

- A variante "cores invertidas (fundo rosa)" é uma alternativa de escolha da equipe ou uma opção que o paciente alterna?
- Os widgets mostram "Enviado" para o exame, mas a spec 001 usa "Recebido". Qual termo vale?
- "Subiu 11 posições este mês" e "↑ 3 posições esta semana" exigem histórico de posição. De onde vem e o paciente vê isso no app também?
- "Analisando seu exame · 2 min": o paciente vê um progresso em tempo real do OCR? Isso exige uma situação com progresso na spec 001.
- A posição exata deve aparecer na tela bloqueada por padrão ou só quando o paciente permitir?

### Médico

- O médico envia documentos (widget "Envio rápido")? O fluxo previsto diz que o médico pode enviar exame ou laudo, mas isso não está em nenhuma spec do Pulse Clinical.
- Os avisos do médico mostram o nome completo do paciente? O Figma mostra "Marina Albuquerque" e "Rita de Cássia Lima". Alternativa: iniciais ou número do pedido.
- Quem implementa: a spec correspondente precisa existir no SUSight-Web (issues #15 a #18).
- Windows 11 é o único alvo no MVP? Como o app web envia avisos ao painel do Windows (precisa de aplicativo instalado)?
- O widget "Aprovações" respeita o mesmo limite de acesso do login do médico (gov.br, CRM e código de 6 dígitos, issue #15)?
