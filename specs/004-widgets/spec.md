# Spec: Widgets e avisos na tela do celular

Issue: #14
Status: rascunho

## Contexto

O paciente deve poder acompanhar a posição na fila e os exames pendentes direto da tela inicial do celular, sem abrir o app, e receber avisos na tela de bloqueio. Os widgets mostram a mesma informação das telas do app (specs 001 e 002) e herdam suas regras: só a fila oficial aprovada é exibida.

## Telas (Figma Hackathona-2026)

Os links abaixo são os candidatos mapeados no Figma. Nem todos precisam entrar no MVP. Base: `https://www.figma.com/design/iy1iFYNgXDrqylPa0JdGrr/Hackathona-2026?node-id=<nó>&m=dev`.

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

**Fora deste repositório:** 98-97 (Windows 11 · painel de widgets e notificações do médico) e 98-96 (rótulo "Médico Windows") são do Pulse Clinical (web) e não entram nesta spec. Todos os nós foram lidos só pela estrutura (nomes e textos), sem captura de tela. O conteúdo das três notificações da tela de bloqueio iOS (101-583) não aparece na estrutura e foi assumido igual ao do Android.

## Comportamento esperado

1. O paciente adiciona o widget de posição na fila. Ele mostra a posição atual em um anel e, conforme o tamanho, a quantidade ou a lista de exames pendentes, e o quanto a posição subiu no período.
2. No Android há ainda widgets pequenos: "Próximo exame" (o exame pendente mais próximo, com prazo) e "Esta semana" (variação de posições na semana).
3. Os widgets são só de visualização rápida. Tocar neles apenas abre o app: no Início (posição) ou na aba Documentos (exames).
4. Os widgets se atualizam quando a posição muda ou quando um exame é pedido, recebido ou entra em análise, sem o paciente abrir o app.
5. Os exames na lista usam as situações da spec 001 (Pendente, Recebido, Em análise).
6. Avisos na tela de bloqueio e na central de notificações: posição mudou (com a nova posição), exame em análise, falta um exame (com o nome do exame) e documento recebido. São as mesmas notificações da spec 002 e respeitam a chave de avisos da spec 003. O aviso de exame pedido sempre chega.
7. Variação de posição ("subiu X posições") só é mostrada quando a posição de fato subiu. Quando desce ou não muda, o widget mostra só a posição atual, sem alarme.
8. Sem dados ou sem conexão, o widget mostra a última informação conhecida com a data, ou orienta a abrir o app.
9. Com Face ID ativado (spec 003), o widget e as notificações mostram uma versão sem a posição exata quando o aparelho está bloqueado.
10. Os widgets seguem o tamanho de texto do sistema e têm contraste adequado, nas duas variantes de cor.

## Critérios de aceite

- [ ] Existe widget de posição na fila em iOS (pequeno e médio) e em Android (largo).
- [ ] Os dados exibidos coincidem com as telas de Início e Documentos do app.
- [ ] Os widgets atualizam após mudança aprovada ou novo exame pedido, sem abrir o app.
- [ ] Tocar abre o app na tela correta e o widget não executa ações.
- [ ] As notificações de posição, exame em análise, exame faltando e documento recebido chegam ao aparelho.
- [ ] Sem conexão, os widgets mostram a última informação com data.
- [ ] "Subiu X posições" só aparece quando a posição subiu.
- [ ] Com o aparelho bloqueado e Face ID ativo, a posição exata não é exibida.
- [ ] Respeitam tamanho de texto do sistema, alvos de toque de 44 pt e contraste (issue #21), nas duas variantes de cor.
- [ ] Textos em português do Brasil, sem alarme e sem prometer data de cirurgia.

## Fora do escopo

- Widgets interativos com ações (enviar documento).
- Widgets e notificações do médico (Pulse Clinical, web).
- Widget para Windows.

## Questões em aberto

- Quais dos candidatos entram no MVP? Sugestão: widget pequeno e médio do iOS e o widget largo do Android, na variante padrão.
- A variante "cores invertidas (fundo rosa)" é uma alternativa de escolha da equipe ou uma opção que o paciente alterna?
- Os widgets mostram "Enviado" para o exame, mas a spec 001 usa "Recebido". Qual termo vale?
- "Enviar até sexta" supõe um prazo para o exame pedido. O médico define prazo? Hoje a spec 001 não tem prazo.
- "Subiu 11 posições este mês" e "↑ 3 posições esta semana" exigem histórico de posição. De onde vem e o paciente vê isso no app também?
- "Analisando seu exame · 2 min": o paciente vê um progresso em tempo real do OCR? Isso exige uma situação com progresso na spec 001.
- A posição exata deve aparecer na tela bloqueada por padrão ou só quando o paciente permitir?
