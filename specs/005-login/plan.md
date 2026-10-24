# Plano: Login do paciente

Spec: ./spec.md
Status: rascunho

## Abordagem

`session.tsx` guarda a sessão num contexto do React e no `expo-secure-store`. A raiz do app decide a rota: sem sessão vai para "Entrar"; com sessão e Face ID ligado, pede biometria antes de mostrar as abas. A atividade é registrada a cada mudança de tela e na volta do app ao primeiro plano; mais de 30 minutos parado encerra a sessão.

"Entrar" valida o CPF pelos dígitos verificadores antes de chamar `requestCode(cpf)`. "Código de verificação" chama `verifyCode(cpf, code)`, conta os erros seguidos e bloqueia por 5 minutos depois do quinto. O reenvio fica desabilitado durante 60 segundos.

## Dados e interfaces

- `requestCode(cpf)`: devolve o telefone mascarado ou falha com mensagem genérica.
- `verifyCode(cpf, code)`: devolve o token da sessão ou falha.
- `isValidCpf(cpf)`, `formatCpf(text)`.
- Paciente e código de demonstração ficam em `api.ts` (dados fictícios).

## Decisões

| Decisão | Alternativas consideradas | Motivo |
|---|---|---|
| CPF com código por SMS | CPF e senha | É o que o Figma (85-1859 e 85-1883) e as decisões da equipe definem; não há senha para criar nem recuperar |
| `expo-secure-store` | AsyncStorage | O token fica no Keychain/Keystore |
| Bloqueio e expiração controlados no app | Só no servidor | O backend ainda não tem rotas de paciente; o servidor deve repetir as regras depois |

## Riscos

- Bloqueio só no app pode ser contornado reinstalando. Mitigação: o servidor real deve aplicar o mesmo limite.
