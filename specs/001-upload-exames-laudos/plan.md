# Plano: Documentos, upload de exames e laudos

Spec: ./spec.md
Status: rascunho

## Abordagem

A aba Documentos lista os documentos de `getDocuments()`. "Adicionar documento" e os itens "Pendente" abrem uma folha inferior (53-2207) com câmera, biblioteca e Arquivos. Câmera e biblioteca usam `expo-image-picker`; Arquivos usa `expo-document-picker` filtrado para PDF, JPG e PNG. O arquivo é validado no aparelho (formato e 20 MB) antes de abrir "Novo documento" (41-514).

"Novo documento" é uma rota modal que recebe o arquivo por parâmetros, mostra pré-visualização, nome, origem, tamanho, legibilidade e o seletor de tipo, sem campo de observações. "Enviar documento" chama `uploadDocument()`. Em caso de falha, a tela continua com o arquivo e o tipo escolhidos e mostra a mensagem com "Tentar de novo". No sucesso, volta para a lista com o aviso "Documento recebido" (41-564).

## Dados e interfaces

- `Doc`: id, nome, tipo (`Exame`, `Laudo`, `Relatório`, `Outro`), data, situação (`pending`, `received`, `analyzing`).
- `getDocuments()`, `uploadDocument({ file, type, requestedId })`. Com `requestedId`, o item "Pendente" vira "Recebido".
- `checkFile(file)`: devolve a mensagem de recusa em português ou `null`.
- `isLegible(file)`: heurística no aparelho.

## Decisões

| Decisão | Alternativas consideradas | Motivo |
|---|---|---|
| Legibilidade por resolução da imagem (lado menor de pelo menos 800 px; PDF conta como legível) | OCR no aparelho, verificação no servidor | Questão em aberto na spec; a heurística só avisa e não bloqueia o envio |
| Folha inferior com `Modal` do React Native | Biblioteca de bottom sheet | Sem dependência nova |
| Arquivo passado por parâmetros da rota | Estado global | Só a tela seguinte usa o arquivo |

## Riscos

- O tamanho do arquivo pode não vir do seletor em alguns aparelhos. Mitigação: sem tamanho conhecido, o arquivo é aceito e o servidor valida de novo.
- A heurística de legibilidade é fraca. Mitigação: só avisa; a decisão final continua com a equipe.
