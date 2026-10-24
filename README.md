# SUSight

Aplicação para gerenciar a fila de cirurgias eletivas do SUS de forma justa, segura e explicável.

## Spec-Driven Development (SDD)

No SDD, a especificação vem antes do código. Cada feature passa por quatro etapas:

1. **Spec:** o que a feature faz e como saber que está pronta.
2. **Plano:** como será construída.
3. **Tarefas:** passos pequenos, cada um vira um commit atômico e começa pelo teste que o comprova.
4. **Implementação (TDD):** primeiro o teste que falha, depois o código que o faz passar. Se precisar divergir da spec, ela é atualizada primeiro.

Os princípios do projeto estão em [specs/constitution.md](specs/constitution.md). Os modelos estão em [specs/_template](specs/_template). O passo a passo completo está em [docs/sdd/MANUAL.md](docs/sdd/MANUAL.md).

## Regras de contribuição

- Commits atômicos.
- Nenhum merge sem revisão de uma pessoa desenvolvedora.

## App Pulse (paciente)

App React Native com Expo na pasta [app/](app). Specs em [specs/](specs), uma pasta por feature, com `spec.md`, `plan.md` e `tasks.md`.

```sh
cd app
npm install
npm test            # testes de componente e de fluxo (jest-expo)
npm run typecheck
npm run ios         # build de desenvolvimento no simulador
```

Sem configuração, o app usa dados de exemplo em `app/src/api.ts`. O paciente de demonstração é fictício: o CPF e o código de verificação estão em `DEMO`, no mesmo arquivo.

### Rodar contra o SUSight-Backend

Com o backend no ar (veja o README dele; `tools/seed_demo.py` cria a fila e o paciente de demonstração), aponte o app para ele:

```sh
cd app
EXPO_PUBLIC_API_URL=http://localhost:8000 npx expo start   # em celular real, use o IP do computador
```

Entre com o CPF `529.982.247-25` e o código `123456`. O backend não envia SMS: o código é a senha provisória da conta. Ele também não guarda nome, município, data de nascimento nem telefone do paciente, então Perfil e o cabeçalho mostram só o que existe. O envio de documento pede o aceite do termo do backend e liga o arquivo ao pedido de exame, quando houver.
