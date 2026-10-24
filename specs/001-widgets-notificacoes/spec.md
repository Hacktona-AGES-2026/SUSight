# Spec: Widgets e notificações do paciente (iOS)

Issue: a criar
Status: rascunho

## Contexto

Quem espera uma cirurgia quer saber como está na fila sem abrir o app todos os dias. O Figma ("7 Widgets do paciente (iOS)") mostra widgets na tela inicial do iPhone e uma notificação quando a posição muda. A informação precisa ser clara e sem alarme (constituição, item 7) e não pode expor dados de saúde para quem olha a tela do celular (item 6).

## Comportamento esperado

### Notificação de mudança de posição

- Quando um médico aprova uma nova fila e a posição do paciente muda, o paciente recebe uma notificação do Pulse.
- Se subiu: "Você subiu <N> posições na fila", com o detalhe "<posição anterior> → <posição atual> · <especialidade> · <município>" (ex.: "44ª → 42ª · Ortopedia · Niterói").
- Se desceu: "Sua posição na fila mudou", com o mesmo detalhe e sem tom de alarme.
- Tocar na notificação abre a tela "Minha jornada".
- O app pede permissão para notificar na primeira vez que o paciente entra, explicando para que serve. O paciente pode recusar sem perder nenhuma função.

### Widget pequeno "Fila do SUS"

- Mostra a posição atual em destaque (ex.: "42ª") e "de <total> · <especialidade>" (ex.: "de 118 · Ortopedia").
- Tocar abre "Minha jornada".

### Widget pequeno "Próximo passo"

- Mostra a próxima ação sugerida ao paciente (ex.: "Atualizar minha situação") e um botão com a ação (ex.: "Enviar exame").
- Tocar no botão abre o app direto na tela da ação.
- Quando o médico pediu informações (SUSight-Web, spec 004), o próximo passo é atender a esse pedido.
- Sem nenhuma ação pendente, mostra "Nada a fazer agora".

### Widget médio "Minha jornada"

- Mostra o número da solicitação (ex.: "Nº 2026-48213"), a situação (ex.: "Aguardando cirurgia"), o procedimento, uma barra de progresso da jornada e a data da última atualização (ex.: "Atualizada em 24 de out").
- Tocar abre "Minha jornada".

### Regras gerais

- Os widgets não mostram CNS, nome do paciente nem diagnóstico.
- Sem sessão, os widgets mostram "Entre no Pulse para ver sua posição".
- Os widgets se atualizam quando o app abre, quando chega uma notificação de mudança e de tempos em tempos.
- Quando os dados estão desatualizados ou indisponíveis, o widget mostra a última informação conhecida com a data dela, nunca uma posição inventada.

## Critérios de aceite

- [ ] Os três widgets podem ser adicionados à tela inicial do iPhone e seguem o Figma.
- [ ] A posição, o total e a especialidade do widget batem com a tela "Minha jornada".
- [ ] Cada widget abre a tela certa do app.
- [ ] Nenhum widget ou notificação mostra CNS, nome do paciente ou diagnóstico.
- [ ] Sem sessão, os widgets mostram o convite para entrar e não mostram dados.
- [ ] Uma mudança de posição aprovada gera a notificação com o texto certo para subida e para descida.
- [ ] Tocar na notificação abre "Minha jornada".
- [ ] Recusar a permissão de notificação não quebra nenhuma função do app.
- [ ] Sem conexão, o widget mostra a última informação com a data dela.

## Fora do escopo

- Widgets no Android.
- Widgets na tela de bloqueio, Live Activities e Apple Watch.
- O cálculo da posição e o envio das notificações (responsabilidade do SUSight-Backend).
- As telas "Minha jornada" e envio de exame em si, que têm specs próprias.

## Questões em aberto

- O widget usa a paleta antiga (azul, verde, amarelo), enquanto o resto do Pulse no Figma já está em rosa. Qual vale?
- O procedimento (ex.: "Artroplastia total de joelho") e a especialidade são dados de saúde. Podem aparecer na tela inicial, ou o paciente escolhe isso no perfil?
- O app deve avisar toda mudança de posição ou só a partir de um número de posições?
- Android entra depois? O app é híbrido, mas o Figma só mostra iOS.
- Quais são as etapas da barra de progresso da jornada?
