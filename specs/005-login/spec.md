# Spec: Login do paciente

Issue: a criar (não há issue de login do paciente)
Status: rascunho

## Contexto

O app mostra dados pessoais de saúde (posição na fila, exames, histórico), então só o próprio paciente deve entrar. Por ser um serviço público, o caminho ideal em produção é o login pelo gov.br. Para o hackathon, a proposta é um login simples próprio, desenhado para poder ser trocado pelo gov.br depois sem mudar o resto do app.

## Telas (Figma Hackathona-2026)

Ainda não há telas de login. A abertura (nó 41-4, spec 002) é a tela anterior ao login. O Perfil (nó 42-887, spec 003) já tem "Sair da conta" e a chave de Face ID. O design de login será feito na hora da implementação.

## Comportamento esperado

1. Depois da tela de abertura, se não houver sessão ativa, o paciente vê a tela de login.
2. O paciente entra com um identificador (CPF ou Cartão SUS) e uma senha. Os pacientes vêm previamente cadastrados a partir do dataset; o app não permite criar conta nova.
3. Se os dados estiverem corretos, o paciente entra no Início (spec 002). Se estiverem incorretos, o app avisa em linguagem simples, sem dizer qual dos dois campos errou.
4. Após algumas tentativas erradas seguidas, o acesso é bloqueado por um tempo, e o app explica quando poderá tentar de novo.
5. A sessão continua ativa entre aberturas do app. Se o Face ID estiver ligado (spec 003), o app pede Face ID ao abrir em vez de pedir a senha de novo.
6. A sessão expira após um período sem uso, e o paciente precisa entrar de novo.
7. "Sair da conta" (spec 003) encerra a sessão e volta para o login.
8. A senha é digitada com os caracteres ocultos e pode ser mostrada com um toque.
9. Quem esqueceu a senha vê a orientação de como recuperá-la (ver questões em aberto).
10. O app só mostra dados do paciente que entrou. Nenhum dado de outro paciente é exibido.

## Critérios de aceite

- [ ] Sem sessão, o app mostra o login depois da abertura.
- [ ] Login correto leva ao Início e login incorreto mostra mensagem sem revelar qual campo errou.
- [ ] Tentativas erradas repetidas bloqueiam o acesso temporariamente, com mensagem clara.
- [ ] A sessão persiste entre aberturas, e com Face ID ligado a autenticação biométrica é exigida ao abrir.
- [ ] A sessão expira por inatividade.
- [ ] "Sair da conta" encerra a sessão e volta ao login.
- [ ] A senha fica oculta por padrão.
- [ ] Cada paciente vê apenas os próprios dados.
- [ ] Identificador e senha não aparecem em registros nem em mensagens de erro.
- [ ] Textos em português do Brasil e linguagem simples.

## Fora do escopo

- Login do médico (Pulse Clinical, issue #15, com gov.br, CRM, senha e código de 6 dígitos).
- Criar conta nova pelo app.
- Login pelo gov.br neste MVP (planejado para depois; ver questões em aberto).
- Login de contatos autorizados: eles só recebem SMS e não acessam o app (spec 003).

## Questões em aberto

- Para o hackathon: login próprio com CPF ou Cartão SUS e senha, ou um acesso de demonstração com pacientes fictícios do dataset? Recomendo o login próprio simples.
- Qual identificador usar, CPF, Cartão SUS ou ambos? O dataset tem esse campo?
- De onde vem a senha inicial do paciente? Quem a cria e como o paciente a recebe sem criar conta?
- Como o paciente recupera a senha: pela UBS, por SMS no telefone cadastrado, ou fora do escopo no MVP?
- Em produção, o gov.br substitui esta tela por completo, ou o paciente pode escolher?
- Quanto tempo de inatividade expira a sessão e quantas tentativas erradas bloqueiam?
