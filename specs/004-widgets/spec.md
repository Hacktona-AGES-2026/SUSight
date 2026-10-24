# Spec: Widgets

Issue: #14
Status: rascunho

## Contexto

O paciente deve poder acompanhar a posição na fila e o próximo passo direto da tela inicial do celular, sem abrir o app. Os widgets mostram a mesma informação da tela de posição (spec 002) e herdam suas regras: só a fila oficial aprovada é exibida.

## Telas (Figma Hackathona-2026)

Ainda não há design dos widgets. Eles devem reaproveitar a informação do cartão da posição (nó 41-21) e do último passo em "Situação atual" (nó 41-111), ambos na spec 002. O design precisa ser feito antes da implementação.

## Comportamento esperado

1. O paciente adiciona o widget de posição na fila à tela inicial. Ele mostra a posição atual, a prioridade e a data da última atualização.
2. O paciente adiciona o widget de próximo passo. Ele mostra em frase curta o que acontece agora, por exemplo "Documento em análise" ou "O médico pediu mais informações".
3. Tocar no widget abre o app na tela correspondente.
4. Os widgets se atualizam quando a posição ou o próximo passo mudam, sem o paciente abrir o app.
5. Sem dados ou sem conexão, o widget mostra a última informação conhecida com a data, ou orienta a abrir o app.
6. Com Face ID ativado (spec 003), o widget mostra uma versão sem a posição exata quando o aparelho está bloqueado, para proteger a privacidade.
7. Os widgets seguem o tamanho de texto do sistema e têm contraste adequado.

## Critérios de aceite

- [ ] Existe um widget de posição na fila e um de próximo passo.
- [ ] Os dados exibidos coincidem com a tela de posição do app.
- [ ] Os widgets atualizam após mudança aprovada, sem abrir o app.
- [ ] Tocar abre o app na tela correta.
- [ ] Sem conexão, mostram a última informação com data.
- [ ] Com o aparelho bloqueado e Face ID ativo, a posição exata não é exibida.
- [ ] Respeitam tamanho de texto do sistema, alvos de toque de 44 pt e contraste (issue #21).
- [ ] Textos em português do Brasil, sem alarme e sem prometer data de cirurgia.

## Fora do escopo

- Widgets interativos com ações (enviar documento).
- Widgets para o médico.
- Notificações (spec 002).

## Questões em aberto

- Quais tamanhos de widget são suportados no MVP?
- Os widgets precisam existir em iOS e Android no MVP, ou só em iOS (alinhado ao estilo Apple)?
- A posição exata deve aparecer na tela bloqueada por padrão ou só quando o paciente permitir?
