# Rinha de Backend 2024 Q1 - Solução em Python/Flask

Esta é uma implementação em Python, utilizando o microframework Flask, como solução para o desafio da **[Rinha de Backend 2024 Q1](https://github.com/zanfranceschi/rinha-de-backend-2024-q1)**.

## Tecnologias Utilizadas

* **Linguagem:** Python 3.11
* **Framework:** Flask
* **Servidor WSGI:** Gunicorn
* **Banco de Dados:** PostgreSQL 16
* **Driver do Banco de Dados:** Psycopg2
* **Proxy Reverso / Load Balancer:** Nginx
* **Containerização:** Docker e Docker Compose

## Como Executar

**Pré-requisitos:** Docker e Docker Compose instalados.

1.  Clone o repositório (ou crie os arquivos conforme a estrutura do projeto).
2.  Navegue até o diretório raiz do projeto.
3.  Execute o seguinte comando para construir as imagens e iniciar os contêineres:

    ```bash
    docker-compose up --build
    ```

    A API estará disponível na porta `9999` do seu `localhost`.


---

## Arquitetura da Solução

A arquitetura foi pensada para atender aos requisitos de concorrência, disponibilidade e performance do desafio, utilizando um conjunto de ferramentas simples e robustas.

### Arquitetura do Backend

* **NGINX como Proxy Reverso e Load Balancer:**
    * Todas as requisições externas chegam primeiro ao Nginx.
    * Ele atua como o único ponto de entrada, distribuindo a carga de forma alternada (round-robin) entre as duas instâncias da nossa API Python.
    * Isso é fundamental para a **disponibilidade** (se uma instância da API falhar, o Nginx redireciona para a outra) e **escalabilidade horizontal** (posso adicionar mais instâncias de API, e o Nginx as balancearia).

* **Instâncias da API (Gunicorn + Flask):**
    * No `docker-compose.yml`, defino dois serviços idênticos: `api1` e `api2`. Isso significa que tenho duas instâncias da nossa aplicação rodando em paralelo.
    * **Gunicorn** é o servidor WSGI escolhido para rodar a aplicação Flask. Ele é robusto e capaz de gerenciar múltiplos *workers* (processos), permitindo que cada instância da API processe várias requisições simultaneamente, aproveitando melhor os recursos de CPU alocados.
    * **Flask** foi escolhido por sua simplicidade e baixo *overhead*, sendo ideal para um microserviço focado como o da Rinha.

### Arquitetura dos Dados

* **Banco de Dados PostgreSQL:**
    * A escolha pelo PostgreSQL se deve à sua robustez, confiabilidade e total conformidade com os princípios ACID (Atomicidade, Consistência, Isolamento, Durabilidade), que são essenciais para sistemas transacionais financeiros.

* **Schema do Banco:**
    * **`clientes`**: Armazena o `limite` e o `saldo` atual. Manter o saldo aqui permite uma leitura rápida para validações de débito, evitando cálculos complexos em tempo real.
    * **`transacoes`**: Registra cada transação de forma imutável. As colunas são indexadas (`cliente_id`) para acelerar a consulta de extratos.

* **Estratégia de Concorrência e Pool de Conexões:**
    * **Pool de Conexões (`psycopg2.SimpleConnectionPool`)**: Para evitar o custo de abrir e fechar uma conexão com o banco de dados a cada requisição, utilizo um pool. A aplicação "pega emprestada" uma conexão existente do pool, usa e a devolve. Isso melhora drasticamente a **performance**.
    * **Trava Pessimista (`SELECT FOR UPDATE`)**: Esta é a decisão de arquitetura mais crítica para garantir a **integridade dos dados**. Ao processar uma transação, executo `SELECT ... FOR UPDATE` na linha do cliente. Isso "tranca" a linha específica, impedindo que qualquer outra transação concorrente leia ou modifique o saldo daquele cliente até que a transação atual seja concluída (`COMMIT`) ou desfeita (`ROLLBACK`). Essa abordagem previne condições de corrida e garante que o saldo nunca se torne inconsistente.

---

## Pontos para Reflexão

### O que foi feito para garantir a Integridade dos Dados?

A integridade é o pilar desta solução. As escolhas foram:
1.  **ACID do PostgreSQL:** A utilização de um banco de dados relacional e transacional é o primeiro passo.
2.  **Transações Atômicas:** Toda a operação de `ler saldo -> validar -> atualizar saldo -> inserir transação` é envolvida em uma única transação de banco de dados. Se qualquer passo falhar, um `ROLLBACK` desfaz todas as alterações, garantindo que o sistema nunca fique em um estado inconsistente.
3.  **Trava Pessimista (`SELECT FOR UPDATE`):** Como explicado na arquitetura, esta é a principal ferramenta contra condições de corrida. Ela garante que apenas uma transação por vez possa operar sobre o saldo de um cliente, serializando o acesso ao recurso crítico e eliminando a possibilidade de saldos incorretos devido à concorrência.

### O que foi feito para garantir a Disponibilidade do Sistema?

1.  **Múltiplas Instâncias da API:** Rodo duas instâncias independentes da aplicação (`api1`, `api2`).
2.  **Load Balancer (Nginx):** Se uma das instâncias da API travar ou reiniciar, o Nginx automaticamente para de enviar tráfego para ela e continua operando com a instância saudável.
3.  **Healthcheck do Banco de Dados:** O `docker-compose.yml` possui uma verificação de saúde (`healthcheck`) para o serviço do banco de dados. As APIs só iniciam após o banco de dados estar totalmente pronto para aceitar conexões, evitando uma cascata de falhas na inicialização.

### O que foi feito para garantir a Escalabilidade do Sistema?

1.  **Escalabilidade Horizontal:** A arquitetura com Nginx + múltiplas instâncias de API é horizontalmente escalável. Para suportar mais carga, poderia adicionar uma `api3`, `api4`, etc., com alterações mínimas no `docker-compose.yml` e no `nginx.conf`.
2.  **Workers do Gunicorn:** Dentro de cada instância da API, o Gunicorn pode ser configurado para rodar mais ou menos *workers*, permitindo uma **escalabilidade vertical** fina, para melhor aproveitar os recursos de CPU e memória alocados para o contêiner.

### O que foi feito para garantir a Performance do Sistema?

1.  **Pool de Conexões:** Reduz a latência ao eliminar a necessidade de estabelecer novas conexões com o banco a cada requisição.
2.  **Índices no Banco de Dados:** A chave estrangeira `cliente_id` na tabela `transacoes` é implicitamente indexada, o que torna a busca pelas últimas transações no extrato extremamente rápida.
3.  **Leveza do Stack:** A combinação Flask + Psycopg2 é muito leve, com baixo consumo de memória e *overhead* mínimo, o que é ideal para o ambiente restrito da Rinha.

### O que foi feito para garantir a Segurança do Sistema?

1.  **Queries Parametrizadas:** O uso de `cursor.execute(query, (params,))` pelo `psycopg2` previne o tipo mais comum de vulnerabilidade web: **SQL Injection**. O driver se encarrega de sanitizar os dados.
2.  **Credenciais como Variáveis de Ambiente:** A URL de conexão com o banco de dados é passada via variável de ambiente para os contêineres da API, em vez de estar "hardcoded" no código.
3.  **Rede Interna do Docker:** O banco de dados não expõe sua porta para o mundo exterior, apenas para a rede interna do Docker, acessível somente pelos outros serviços definidos no `docker-compose.yml`.

### O que foi feito para garantir a Manutenibilidade do Sistema?

1.  **Estrutura de Projeto Clara:** A separação de responsabilidades em pastas (`api`, `docker`) torna o projeto fácil de navegar.
2.  **Código Simples e Direto:** A lógica foi mantida o mais simples possível, sem abstrações desnecessárias ou complexidade acidental, favorecendo a legibilidade.
3.  **Infraestrutura como Código:** O uso do `docker-compose.yml` e do `init.sql` permite que qualquer desenvolvedor recrie o ambiente de desenvolvimento e produção de forma idêntica e automatizada com um único comando.

### O que foi feito para garantir a Testabilidade do Sistema?

1.  **API com Contrato Claro:** Os endpoints possuem entradas (`request`) e saídas (`response`) bem definidas, o que facilita a criação de testes de integração e de contrato.
2.  **Ambiente Replicável:** Graças ao Docker, é trivial criar um ambiente de testes completamente isolado, com um banco de dados limpo, para rodar uma suíte de testes automatizados.











