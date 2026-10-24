# Spec: Documentos: upload de exames e laudos

Issue: #10
Status: rascunho

## Contexto

O paciente em espera por cirurgia eletiva envia exames e laudos para que a IA reavalie sua posição na fila. Este é o ponto de entrada do ciclo da IA: o documento é recebido, a IA aplica os critérios, o tribunal de IAs debate a mudança de posição e o médico revisa a proposta. O paciente só vê a fila mudar depois da aprovação do médico (spec 002).

## Telas (Figma Hackathona-2026, seção Paciente · Documentos)

| Tela | Nó | O que mostra |
|---|---|---|
| Documentos (lista) | 41-252 | Título, lista de documentos enviados com tipo, data e situação, botão "Adicionar documento" |
| Documentos (confirmação pedida) | 41-564 | Aviso "Documento recebido" após envio, e um documento com o cartão "Confirmação pedida" |
| Seletor de origem | 53-2207 | Folha inferior: Tirar foto, Biblioteca de fotos, Escolher em Arquivos (PDF, JPG ou PNG, até 20 MB), Cancelar |
| Novo documento | 41-514 | Pré-visualização, nome, origem e tamanho do arquivo, indicador de legibilidade, tipo, observações, "Enviar documento" |

## Comportamento esperado

1. Na aba Documentos, o paciente vê a lista dos documentos que enviou, do mais recente ao mais antigo. Cada item mostra nome, tipo, data e situação.
2. As situações possíveis são: **Recebido**, **Em análise**, **Precisa de confirmação** e **Revisado**.
3. "Adicionar documento" abre o seletor de origem: câmera, biblioteca de fotos ou Arquivos. Formatos aceitos: PDF, JPG e PNG, até 20 MB.
4. Escolhido o arquivo, abre "Novo documento" com pré-visualização, nome, origem, tamanho e um selo "Legível" quando a imagem puder ser lida. "Cancelar" volta sem enviar.
5. O paciente escolhe o tipo: Exame, Laudo, Relatório ou Outro. O padrão é Exame.
6. O paciente pode escrever observações opcionais para a equipe.
7. "Enviar documento" envia. Ao voltar para a lista, aparece o aviso "Documento recebido" dizendo que um profissional de saúde vai analisar e que o paciente será avisado das novidades.
8. Quando a equipe pede uma confirmação (por exemplo, se a imagem está legível), o documento passa a "Precisa de confirmação" e mostra o cartão "Confirmação pedida" com o pedido em linguagem simples. O paciente responde reenviando o documento por este mesmo fluxo. Esse é o caminho do pedido de informações (spec 002).
9. Se a imagem não estiver legível, o selo avisa antes do envio e o paciente pode trocar o arquivo.
10. Se o envio falhar, o app explica o motivo em linguagem simples e permite tentar de novo sem perder a seleção, o tipo nem as observações.

O app nunca interpreta o conteúdo do exame, não promete que a posição vai subir e não faz diagnóstico.

## Critérios de aceite

- [ ] A lista mostra nome, tipo, data e situação de cada documento, com as quatro situações previstas.
- [ ] O seletor oferece câmera, biblioteca de fotos e Arquivos.
- [ ] Apenas PDF, JPG e PNG de até 20 MB são aceitos. Outros são recusados com mensagem em português do Brasil.
- [ ] A tela "Novo documento" mostra pré-visualização, nome, origem, tamanho e legibilidade antes do envio.
- [ ] O tipo vem preenchido com Exame e pode ser trocado para Laudo, Relatório ou Outro.
- [ ] As observações são opcionais.
- [ ] Após o envio, o aviso "Documento recebido" aparece e o documento entra na lista como "Recebido".
- [ ] Um pedido de confirmação da equipe mostra "Precisa de confirmação" e o cartão "Confirmação pedida".
- [ ] Falha de envio permite nova tentativa sem perder o preenchido.
- [ ] Nenhum texto faz diagnóstico, promete mudança de posição ou usa tom de alarme.
- [ ] O documento só é visível para o próprio paciente e para a equipe autorizada (LGPD).

## Fora do escopo

- Análise do documento e pontuação (backend, issues #7 e #6).
- Envio por chatbot (fora do escopo do projeto).
- Edição do conteúdo do documento dentro do app.

## Questões em aberto

- Como a legibilidade é detectada (no aparelho ou no servidor) e o que acontece com um documento ilegível: bloqueia o envio ou só avisa?
- Como o paciente responde a "Confirmação pedida": reenvia o arquivo ou confirma com um toque? O design não mostra essa ação.
- O paciente pode enviar vários arquivos de uma vez ou um por envio?
- O paciente pode cancelar ou excluir um documento já enviado?
- A lista mostra três itens repetidos de "Eletrocardiograma pré-operatório" e "Raio-X do joelho direito" no Figma. São dados de exemplo ou reenvios? Isso muda a ordenação e o agrupamento.
- A tela de documentos não mostra o campo "preencha dados faltantes" do quadro. Esses dados serão cobrados em outro lugar (perfil)?
