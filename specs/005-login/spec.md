# Spec: Login do paciente

Issue: #32
Status: rascunho

## Contexto

O app mostra dados pessoais de saúde (posição na fila, exames, histórico), então só o próprio paciente deve entrar. Por ser um serviço público, o caminho ideal em produção é o login pelo gov.br. Como nem todo paciente tem conta gov.br com nível suficiente, o app também aceita o CPF com um código enviado por SMS ao telefone cadastrado na UBS. Não há senha: o paciente não cria nem guarda senha.

## Telas (Figma Hackathona-2026)

| Tela | Nó | O que mostra |
|---|---|---|
| Entrar | 85-1859 | Logo, "Entrar no SUSight", botão "Entrar com gov.br", campo CPF, "Enviar código" e a nota de validação profissional |
| Código de verificação | 85-1883 | "Digite o código", telefone mascarado, campo de 6 dígitos, "Reenviar código em 0:42" e "Entrar" |

A abertura (nó 41-4, spec 002) é a tela anterior ao login. O Perfil (nó 42-887, spec 003) tem "Sair da conta" e a chave de Face ID.

## Comportamento esperado

1. Depois da tela de abertura, se não houver sessão ativa, o paciente vê a tela de login.
2. O paciente informa o CPF e toca em "Enviar código". Os pacientes vêm previamente cadastrados a partir do dataset; o app não permite criar conta nova.
3. Um código de 6 dígitos chega por SMS ao telefone cadastrado, exibido mascarado na tela do código. O paciente pode pedir um novo código depois de 60 segundos.
4. Com o código certo, o paciente entra no Início (spec 002). Com CPF não cadastrado ou código errado, o app avisa em linguagem simples, sem dizer se o CPF existe.
5. Após 5 códigos errados seguidos, o acesso é bloqueado por 5 minutos, e o app explica quando poderá tentar de novo.
6. A sessão continua ativa entre aberturas do app. Se o Face ID estiver ligado (spec 003), o app pede Face ID ao abrir.
7. A sessão expira após 30 minutos sem uso, e o paciente precisa entrar de novo.
8. "Sair da conta" (spec 003) encerra a sessão e volta para o login.
9. "Entrar com gov.br" aparece na tela, mas no MVP avisa que o acesso pelo gov.br ainda não está disponível e orienta a entrar com o CPF.
10. O app só mostra dados do paciente que entrou. Nenhum dado de outro paciente é exibido.

## Critérios de aceite

- [ ] Sem sessão, o app mostra o login depois da abertura.
- [ ] CPF inválido não envia código e mostra mensagem clara.
- [ ] Código certo leva ao Início; CPF não cadastrado ou código errado mostram mensagem que não revela se o CPF existe.
- [ ] Cinco códigos errados seguidos bloqueiam o acesso por 5 minutos, com mensagem clara.
- [ ] O reenvio do código só fica disponível depois da contagem.
- [ ] A sessão persiste entre aberturas, e com Face ID ligado a autenticação biométrica é exigida ao abrir.
- [ ] A sessão expira após 30 minutos sem uso.
- [ ] "Sair da conta" encerra a sessão e volta ao login.
- [ ] "Entrar com gov.br" orienta a usar o CPF enquanto o gov.br não estiver integrado.
- [ ] Cada paciente vê apenas os próprios dados.
- [ ] CPF e código não aparecem em registros nem em mensagens de erro.
- [ ] Textos em português do Brasil e linguagem simples.

## Testes (TDD)

Os testes vêm antes do código. Cada critério de aceite acima vira pelo menos um teste automatizado que falha primeiro (red), e a implementação só termina quando todos passam (green). Critério que não puder ser testado automaticamente leva uma justificativa escrita. Testes de componente e de fluxo do app (issue #26).

## Fora do escopo

- Login do médico (Pulse Clinical, issue #15, com gov.br, CRM, senha e código de 6 dígitos).
- Criar conta nova pelo app.
- Integração real com o gov.br e envio real de SMS neste MVP (o backend ainda não tem rotas de paciente).
- Login de contatos autorizados: eles só recebem SMS e não acessam o app (spec 003).

## Questões em aberto

- O dataset tem CPF e telefone? Hoje o app usa um paciente fictício até o backend expor as rotas de paciente.
- O que acontece se o paciente trocou de telefone: atualiza na UBS?
- Em produção, o gov.br substitui o CPF com SMS por completo, ou o paciente pode escolher?
