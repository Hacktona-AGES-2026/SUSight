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
