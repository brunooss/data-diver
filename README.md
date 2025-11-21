# DataDiver

## Membros do Grupo

*   Bruno Oliveira Souza Santos
*   Bruno Oliveira Souza Santos
*   Bruno Oliveira Souza Santos
*   Bruno Oliveira Souza Santos

## Sobre o Sistema

O DataDiver é um aplicativo de apoio à decisão projetado para ajudar os usuários a navegar por escolhas complexas com mais clareza e confiança. A plataforma oferece um conjunto de ferramentas inteligentes, cada uma adaptada a um tipo diferente de dilema:

*   **Decisão Sim/Não:** Para escolhas binárias rápidas.
*   **Múltipla Escolha:** Para comparar várias opções distintas.
*   **Análise Ponderada:** Para decisões complexas com múltiplos critérios e pesos.
*   **Análise Financeira:** Para avaliar cenários com custos fixos e variáveis.
*   **Gasto Financeiro:** Para comparar opções como financiamento e consórcio.

Utilizando inteligência artificial, o DataDiver fornece insights, sugere cenários e ajuda a estruturar o raciocínio, transformando dados e prioridades em recomendações claras e objetivas.

## Tecnologias Utilizadas

Este projeto foi construído utilizando um stack de tecnologias moderno e robusto, focado em performance, qualidade de código e uma ótima experiência de desenvolvimento.

*   **Framework:** [Next.js](https://nextjs.org/) (com App Router)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **UI/Componentes:** [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Inteligência Artificial:** [Google AI (via Genkit)](https://firebase.google.com/docs/genkit)
*   **Testes:** [Vitest](https://vitest.dev/)
*   **CI/CD:** [GitHub Actions](https://github.com/features/actions) para integração com [Codecov](https://about.codecov.io/)

## Como Executar os Testes

Para garantir a qualidade e a estabilidade do código, o projeto conta com uma suíte de testes unitários. Para executá-los localmente, siga os passos:

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Rode os testes:**
    Para executar todos os testes no terminal, use o comando:
    ```bash
    npm run test
    ```
    Este comando também gerará um relatório de cobertura de código.

3.  **Rode os testes + Cobertura dos testes:**
    É possível obter a cobertura do código pelo próprio _Vitest_ por meio do comando:

    ```bash
    npx vitest run --coverage
    ```

4. **Codecov (Integração Contínua):**
   Utilizamos o [Codecov](https://about.codecov.io/) como uma ferramenta para monitorar a cobertura de testes do nosso código. Ele gera relatórios visuais que nos ajudam a entender quais partes do código estão sendo testadas e onde podemos melhorar.

   A cada novo `commit` ou `pull request` enviado para o repositório, o GitHub Actions executa automaticamente todos os testes e envia o relatório de cobertura para o Codecov. Isso garante que tenhamos uma visão sempre atualizada da qualidade dos nossos testes.

   