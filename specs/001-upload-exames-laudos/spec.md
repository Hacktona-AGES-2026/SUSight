# Spec: Upload de exames e laudos

Issue: #10
Status: rascunho

## Contexto

O paciente em espera por cirurgia eletiva precisa enviar exames e laudos para que a IA reavalie sua posição na fila. Este é o ponto de entrada do ciclo da IA: o documento enviado é recebido, a IA aplica os critérios (limitação funcional, ASA, dor, questões socioeconômicas, comorbidades, tempo de espera e deterioração durante a espera), o tribunal de IAs debate a mudança de posição e o médico revisa a proposta. O paciente só vê a fila mudar depois da aprovação do médico (ver spec 002).

## Comportamento esperado

1. Na tela de upload, o paciente escolhe a origem do arquivo: câmera, galeria ou arquivos.
2. O paciente vê uma pré-visualização do documento (imagem ou PDF) e pode refazer a captura ou trocar o arquivo.
3. O paciente informa o tipo do documento: exame ou laudo.
4. O app mostra "preencha dados faltantes" quando o documento ou o cadastro estiver sem informação necessária para a análise (por exemplo, data do exame ou tipo). O paciente completa os campos antes de confirmar.
5. O paciente confirma o envio e vê uma mensagem clara de que o documento foi recebido e está em análise.
6. O documento enviado aparece no histórico (spec 004) com a situação "em análise".
7. Se o envio falhar (sem conexão, arquivo inválido), o app explica o motivo em linguagem simples e permite tentar de novo sem perder a seleção.
8. Quando a análise termina, o paciente é avisado (spec 002). Se o médico pedir mais informações, o paciente recebe o pedido e pode enviar um novo documento por este mesmo fluxo.

O app nunca promete que a posição vai subir e nunca interpreta o conteúdo do exame para o paciente (sem diagnóstico).

## Critérios de aceite

- [ ] O paciente consegue enviar um documento a partir da câmera, da galeria e dos arquivos.
- [ ] A pré-visualização é exibida antes da confirmação e permite trocar o arquivo.
- [ ] O tipo (exame ou laudo) é obrigatório para confirmar.
- [ ] Campos faltantes são indicados e o envio só é confirmado com eles preenchidos.
- [ ] Após o envio, o paciente vê confirmação de recebimento e o documento fica "em análise".
- [ ] Tipos e tamanhos de arquivo não suportados são recusados com mensagem em português do Brasil.
- [ ] Falha de envio permite nova tentativa sem refazer a seleção.
- [ ] Nenhum texto do app faz diagnóstico, promete mudança de posição ou usa tom de alarme.
- [ ] O documento enviado fica visível apenas para o próprio paciente e para a equipe autorizada (LGPD).

## Fora do escopo

- Análise do documento e pontuação (backend, issues #7 e #6).
- Envio por chatbot (fora do escopo do projeto).
- Edição do conteúdo do documento dentro do app.

## Questões em aberto

- Quais formatos e qual tamanho máximo de arquivo são aceitos?
- Quais são exatamente os "dados faltantes" cobrados no envio (lista de campos)?
- O paciente pode enviar vários arquivos de uma vez ou um por envio?
- O paciente pode cancelar ou excluir um documento já enviado?
