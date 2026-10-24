# Spec: Documentos: upload de exames e laudos

Issue: #10
Status: rascunho

## Contexto

O paciente em espera por cirurgia eletiva envia exames e laudos para que a IA reavalie sua posição na fila. Este é o ponto de entrada do ciclo da IA: o documento é recebido, a IA aplica os critérios, o tribunal de IAs debate a mudança de posição e o médico revisa a proposta. O paciente só vê a fila mudar depois da aprovação do médico (spec 002).

## Telas (Figma Hackathona-2026, seção Paciente · Documentos)

| Tela | Nó | O que mostra |
|---|---|---|
| Documentos (lista) | 41-252 | Título, lista de documentos enviados com tipo, data e situação, botão "Adicionar documento" |
| Documentos (após envio) | 41-564 | Aviso "Documento recebido" após o envio. O cartão "Confirmação pedida" e as situações "Precisa de confirmação" e "Revisado" desta tela ficam fora do escopo (ver Fora do escopo) |
| Seletor de origem | 53-2207 | Folha inferior: Tirar foto, Biblioteca de fotos, Escolher em Arquivos (PDF, JPG ou PNG, até 20 MB), Cancelar |
| Novo documento | 41-514 | Pré-visualização, nome, origem e tamanho do arquivo, indicador de legibilidade, tipo, "Enviar documento" |

## Comportamento esperado

1. Na aba Documentos, o paciente vê a lista dos documentos que enviou, do mais recente ao mais antigo. Cada item mostra nome, tipo, data e situação.
2. As situações possíveis são três: **Pendente** (exame pedido pelo médico que o paciente ainda não enviou), **Recebido** (logo após o envio) e **Em análise** (enquanto o backend lê o documento por OCR e preenche sozinho os campos dos critérios da fila que dependem do documento: limitação funcional, ASA, dor, questões socioeconômicas, comorbidades e deterioração). O paciente não preenche esses campos nem confirma nada nos documentos.
3. Quando o médico pede um exame, ele aparece na lista como item "Pendente", com o nome do exame pedido. Ao tocar nele, o paciente vai direto ao envio daquele exame (seletor de origem e "Novo documento" já associados ao exame pedido). Ao enviar o arquivo, o item passa a "Recebido" e depois "Em análise".
4. "Adicionar documento" abre o seletor de origem: câmera, biblioteca de fotos ou Arquivos. Formatos aceitos: PDF, JPG e PNG, até 20 MB.
5. Escolhido o arquivo, abre "Novo documento" com pré-visualização, nome, origem, tamanho e um selo "Legível" quando a imagem puder ser lida. "Cancelar" volta sem enviar.
6. O paciente escolhe o tipo: Exame, Laudo, Relatório ou Outro. O padrão é Exame.
7. Não há campo de texto livre: o paciente só envia o arquivo e escolhe o tipo, para que a análise dependa apenas do conteúdo dos exames.
8. "Enviar documento" envia. Ao voltar para a lista, aparece o aviso "Documento recebido" dizendo que um profissional de saúde vai analisar e que o paciente será avisado das novidades.
9. Se a imagem não estiver legível, o selo avisa antes do envio e o paciente pode trocar o arquivo.
10. Se o envio falhar, o app explica o motivo em linguagem simples e permite tentar de novo sem perder a seleção, nem o tipo.

O CID e o tempo de espera já vêm preenchidos do cadastro e não dependem do OCR. O preenchimento dos campos é feito pelo backend, nunca pelo app, e o resultado é só uma entrada para a IA e para a revisão do médico. O app nunca interpreta o conteúdo do exame, não promete que a posição vai subir e não faz diagnóstico.

## Critérios de aceite

- [ ] A lista mostra nome, tipo, data e situação de cada documento, com as situações Pendente, Recebido e Em análise.
- [ ] O seletor oferece câmera, biblioteca de fotos e Arquivos.
- [ ] Apenas PDF, JPG e PNG de até 20 MB são aceitos. Outros são recusados com mensagem em português do Brasil.
- [ ] A tela "Novo documento" mostra pré-visualização, nome, origem, tamanho e legibilidade antes do envio.
- [ ] O tipo vem preenchido com Exame e pode ser trocado para Laudo, Relatório ou Outro.
- [ ] A tela "Novo documento" não tem campo de observações.
- [ ] Após o envio, o aviso "Documento recebido" aparece e o documento entra na lista como "Recebido".
- [ ] Um exame pedido pelo médico aparece como "Pendente", abre o envio daquele exame ao tocar e muda para "Recebido" quando o paciente o envia.
- [ ] Nenhum documento exige confirmação do paciente depois do envio.
- [ ] Falha de envio permite nova tentativa sem perder o preenchido.
- [ ] Nenhum texto faz diagnóstico, promete mudança de posição ou usa tom de alarme.
- [ ] O documento só é visível para o próprio paciente e para a equipe autorizada (LGPD).

## Fora do escopo

- Análise do documento e pontuação (backend, issues #7 e #6).
- Envio por chatbot (fora do escopo do projeto).
- Pedido de confirmação ao paciente sobre um documento ("Precisa de confirmação", "Confirmação pedida") e situação "Revisado". O pedido de informações do médico (por exemplo, um novo exame) chega por notificação e o paciente o atende enviando um documento por este mesmo fluxo.
- Pedidos de informação que não sejam exames: o médico só pode pedir exames por enquanto.
- Edição do conteúdo do documento dentro do app.

## Questões em aberto

- Se o OCR não conseguir ler um campo, o campo fica vazio para o médico (o paciente não completa nada). Confirmar com o backend.
- O paciente vê o que foi extraído do documento ou só a situação?

- Como a legibilidade é detectada (no aparelho ou no servidor) e o que acontece com um documento ilegível: bloqueia o envio ou só avisa?
- O design 41-564 ainda mostra o campo de observações, "Precisa de confirmação", "Revisado" e o cartão "Confirmação pedida". Atualizar o Figma para refletir só Pendente, Recebido e Em análise.
- O paciente pode enviar vários arquivos de uma vez ou um por envio?
- O paciente pode cancelar ou excluir um documento já enviado?
- A lista mostra três itens repetidos de "Eletrocardiograma pré-operatório" e "Raio-X do joelho direito" no Figma. São dados de exemplo ou reenvios? Isso muda a ordenação e o agrupamento.
