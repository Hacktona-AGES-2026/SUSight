# Spec: Histórico, perfil e preferências

Issue: #13
Status: rascunho

## Contexto

O paciente precisa de um lugar único para rever tudo o que enviou e recebeu ("histórico geral"), conferir seus dados e controlar privacidade e avisos. Esta tela também concentra os direitos do paciente pela LGPD.

## Comportamento esperado

**Histórico**

1. O histórico lista, em ordem cronológica, laudos e exames enviados (spec 001), atualizações de situação (spec 003) e mudanças de posição aprovadas (spec 002).
2. Cada item mostra tipo, data e situação: "em análise", "revisado", "informação solicitada" ou "posição atualizada".
3. Tocar em um item abre o detalhe: o documento enviado, o relato ou o motivo da mudança de posição em linguagem simples.
4. O paciente pode filtrar por tipo (exames, laudos, relatos, posição).

**Perfil**

5. O perfil mostra nome, CNS mascarado e dados cadastrais. Dados faltantes são sinalizados com atalho para completá-los.
6. O paciente pode cadastrar contatos autorizados: pessoas que podem receber avisos ou ajudar no acompanhamento.

**Preferências**

7. O paciente liga ou desliga cada tipo de notificação (spec 002).
8. O paciente pode ativar o Face ID para abrir o app.
9. Em privacidade (LGPD), o paciente vê quais dados são tratados, para quê, e pode consultar o consentimento, pedir uma cópia dos seus dados e pedir a exclusão, quando aplicável.
10. O paciente pode sair da conta.

## Critérios de aceite

- [ ] O histórico reúne exames, laudos, relatos e mudanças de posição em ordem cronológica.
- [ ] Cada item mostra tipo, data e situação, e abre o detalhe.
- [ ] O filtro por tipo funciona.
- [ ] CNS e dados sensíveis aparecem mascarados por padrão.
- [ ] Contatos autorizados podem ser adicionados, editados e removidos.
- [ ] Cada tipo de notificação pode ser desativado individualmente, e o app respeita a escolha.
- [ ] O Face ID pode ser ativado e desativado, e o app pede autenticação ao abrir quando ativo.
- [ ] A seção de privacidade explica o uso dos dados e permite pedir cópia e exclusão.
- [ ] Histórico vazio mostra estado explicativo, não uma tela em branco.
- [ ] Textos em português do Brasil e linguagem simples.

## Fora do escopo

- Editar ou apagar documentos já enviados e analisados (a decisão consta nas questões em aberto).
- Cadastro inicial e login do paciente, se ainda não definidos em outra spec.
- Histórico de decisões internas do médico (auditoria no backend, issue #19).

## Questões em aberto

- O paciente vê o histórico completo de posições ou só o das mudanças aprovadas?
- Contatos autorizados recebem quais informações, e como o consentimento deles é registrado?
- Como o pedido de exclusão convive com a obrigação de manter registros auditáveis das decisões?
- Há login por gov.br ou outra forma para o paciente? Isso precisa de spec própria?
