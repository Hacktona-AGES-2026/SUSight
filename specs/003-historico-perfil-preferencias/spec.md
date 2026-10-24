# Spec: Histórico, perfil e preferências

Issue: #13
Status: rascunho

## Contexto

O paciente precisa de um lugar único para rever tudo o que aconteceu na sua solicitação ("histórico geral"), conferir seus dados e controlar avisos, contatos e privacidade. Também concentra os direitos do paciente pela LGPD. As notificações em si estão na spec 002.

## Telas (Figma Hackathona-2026, seção Paciente · Histórico, notificações e perfil)

| Tela | Nó | O que mostra |
|---|---|---|
| Histórico | 42-713 | Linha do tempo "Tudo o que aconteceu na sua solicitação, do mais recente ao mais antigo" |
| Perfil | 42-887 | Identificação, dados básicos, chaves de avisos, contatos, privacidade, Face ID e "Sair da conta" |
| Contatos autorizados | 86-1960 | Lista de contatos, aviso "O que eles recebem" e "Adicionar contato" |
| Novo contato | 86-2027 | Nome, parentesco, telefone e "Salvar contato" |
| Contato | 86-2068 | Detalhe do contato e "Remover contato" |
| Privacidade e dados | 86-1882 | Como usamos os dados, quem acessa, direitos LGPD |
| Notificações | 42-816 | Tela aberta pelo sino do Início (spec 002) |

Os nós 42-712 e 86-2167 são só rótulos de seção.

## Comportamento esperado

**Histórico**

1. A aba Histórico lista, do mais recente ao mais antigo, tudo o que aconteceu na solicitação: entrada na fila, documentos enviados, pedidos de informação, prioridade validada, reavaliação concluída e mudanças de posição aprovadas.
2. Cada item tem título, descrição curta, data e um ponto colorido. Os itens recentes têm ponto destacado e os antigos, cinza.
3. O histórico mostra apenas fatos já registrados. Nada que seja proposta ainda em análise ou em revisão aparece como mudança de posição.

**Perfil**

4. O topo mostra iniciais, nome e Cartão SUS mascarado (apenas os 4 últimos dígitos).
5. "Dados básicos" mostra nascimento, telefone mascarado e município.
6. "Notificações e acompanhamento" tem uma chave para os avisos no aplicativo (documento recebido, análise concluída, prioridade validada). O aviso de exame pedido não pode ser desligado e sempre chega. Não há canal de WhatsApp.
7. "Privacidade e contatos" tem: contatos autorizados (com resumo do primeiro contato), privacidade e dados, e a chave "Bloqueio com Face ID".
8. "Sair da conta" encerra a sessão.

**Contatos autorizados**

9. A lista mostra nome, parentesco e telefone mascarado de cada pessoa que pode acompanhar a situação. O cartão "O que eles recebem" explica que recebem avisos curtos sobre a situação da solicitação e **não veem exames, laudos nem relatos**.
10. "Adicionar contato" abre o formulário com nome, parentesco (Filho ou filha, Cônjuge, Pai ou mãe, Irmão ou irmã, Outro) e telefone. Abaixo, o aviso de que será enviado um SMS informando que o paciente autorizou o acompanhamento.
11. Tocar em um contato abre o detalhe, com a data desde quando acompanha e que recebe avisos por SMS, e o botão "Remover contato".

**Privacidade e dados**

12. A tela explica como os dados são usados (organizar a fila de forma justa e manter a posição atualizada; não são vendidos nem compartilhados com empresas) e quem acessa: Regulação do SUS (valida prioridades e organiza a fila), Profissionais de saúde (revisam documentos) e Assistente de IA (só lê documentos para propor; quem decide é sempre um profissional).
13. "Seus direitos (LGPD)" tem "Pedir uma cópia dos meus dados" (a resposta chega pelo aplicativo) A exclusão da fila é tratada no Pulse Clinical (web), não neste app.

**Face ID**

14. Com a chave ligada, o app pede Face ID ao abrir.

## Critérios de aceite

- [ ] O histórico reúne os eventos da solicitação em ordem cronológica, com título, descrição, data e ponto.
- [ ] Histórico vazio mostra um estado explicativo.
- [ ] Cartão SUS e telefones aparecem mascarados.
- [ ] A chave de avisos no aplicativo funciona e o app respeita a escolha, exceto o aviso de exame pedido, que sempre chega.
- [ ] Contatos autorizados podem ser adicionados e removidos, e o contato recebe SMS informando a autorização.
- [ ] Contatos nunca recebem exames, laudos nem conteúdo dos documentos.
- [ ] A tela de privacidade lista quem acessa os dados, incluindo o papel do assistente de IA.
- [ ] O pedido de cópia dos dados está disponível.
- [ ] O Face ID pode ser ligado e desligado, e é exigido ao abrir quando ligado.
- [ ] "Sair da conta" encerra a sessão.
- [ ] Textos em português do Brasil e linguagem simples.

## Testes (TDD)

Os testes vêm antes do código. Cada critério de aceite acima vira pelo menos um teste automatizado que falha primeiro (red), e a implementação só termina quando todos passam (green). Critério que não puder ser testado automaticamente leva uma justificativa escrita. Testes de componente e de fluxo do app (issue #26).

## Fora do escopo

- Editar ou apagar documentos já enviados.
- Exclusão da fila e dos dados do paciente: feita no Pulse Clinical (web), outro repositório.
- Login do paciente (spec 005).
- Histórico de decisões internas do médico (auditoria no backend, issue #19).
- Relatos de sintomas pelo paciente: o app não tem esse recurso.

## Questões em aberto

- **O Figma contradiz decisões da equipe e precisa ser atualizado:**
  - Histórico (42-713): "Atualização enviada por você · Seu relato" e "Possível alteração clínica identificada" pressupõem relato do paciente.
  - Histórico (42-713): "Pedido de informação adicional · confirme se a imagem está legível" pressupõe confirmação em documento, que não existe.
  - Notificações (42-816): "Precisamos de uma confirmação" e "Atualização analisada" têm o mesmo problema.
  - Contatos (86-1960): "não veem seus exames, laudos nem relatos" cita relatos.
  - Para o paciente, o pedido de informação deve ser um exame "Pendente" (spec 001), e as chaves "Pedidos de informação" e "Acompanhar pelo WhatsApp" do Perfil (42-887) devem sair, assim como "Pedir a exclusão dos meus dados" na tela de privacidade (86-1882).
- Dados básicos (nascimento, telefone, município) são só leitura? Vêm do cadastro da regulação?
- O paciente vê o histórico completo de posições ou só o das mudanças aprovadas?
- Como o consentimento do contato é registrado, já que ele só recebe um SMS?
