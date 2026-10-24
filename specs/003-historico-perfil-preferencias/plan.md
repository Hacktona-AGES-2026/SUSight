# Plano: Histórico, perfil e preferências

Spec: ./spec.md
Status: rascunho

## Abordagem

Usa a fundação da spec 002. O Histórico lista `getHistory()` com o componente de evento do design system. O Perfil lê `getProfile()` e guarda as preferências (avisos no aplicativo e Face ID) na sessão (`session.tsx`), persistidas com `expo-secure-store`. Contatos autorizados e Privacidade são rotas da pilha raiz, com "Novo contato" como modal.

A chave de avisos filtra as notificações da spec 002: com ela desligada, só o aviso de exame pedido continua. A chave de Face ID só liga depois de uma autenticação com `expo-local-authentication` dar certo.

## Dados e interfaces

- `Profile`: nome, final do Cartão SUS, nascimento, telefone mascarado, município.
- `Contact`: id, nome, parentesco, telefone mascarado, desde quando acompanha.
- `getHistory()`, `getProfile()`, `getContacts()`, `addContact()`, `removeContact()`, `requestDataCopy()`.
- `maskPhone()` mostra só os 4 últimos dígitos.

## Decisões

| Decisão | Alternativas consideradas | Motivo |
|---|---|---|
| Preferências no `expo-secure-store` | AsyncStorage | Já é usado pela sessão; evita outra dependência |
| Sem "Pedidos de informação", WhatsApp, "Pedir a exclusão" e "Bran Framework" | Seguir o Figma | A spec retira esses itens; o Figma ainda precisa ser atualizado |
| Face ID na lista "Privacidade e contatos" | Linha própria | A spec põe a chave nessa seção |

## Riscos

- Aparelho sem biometria cadastrada. Mitigação: a chave explica e continua desligada.
