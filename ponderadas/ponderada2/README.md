# Duvido Game – Sistema Completo (Backend + Frontend)

## Visão Geral

Este projeto implementa um jogo de cartas chamado **Duvido**, composto por:

- **Frontend (app/):** Aplicativo React Native/Expo para jogar, com autenticação OTP (One Time Password) via e-mail.
- **Backend (src/app/):** API em Python (FastAPI) para autenticação, gerenciamento de conquistas e persistência dos dados.

Para essa atividade, ponderada 2, acrescentou-se um backend ao frontend produzido para a ponderada 1.

---

## Backend (FastAPI)

### Funcionalidades

- **Autenticação OTP:** Usuários se registram e fazem login usando e-mail e código OTP enviado por e-mail.
- **JWT:** Após autenticação, o backend retorna um token JWT para ser usado nas requisições protegidas.
- **Conquistas:** O backend gerencia conquistas do jogo, permitindo desbloqueio e consulta.
- **Admin:** Endpoint para listar todas as conquistas desbloqueadas por todos os usuários.

### Estrutura dos Arquivos

- `main.py` – Inicialização do FastAPI, CORS, criação de tabelas e carregamento de variáveis de ambiente.
- `routes.py` – Define as rotas de autenticação, conquistas e admin.
- `models.py` – Modelos SQLAlchemy para conquistas, usuários e conquistas desbloqueadas.
- `schemas.py` – Schemas Pydantic para validação de dados.
- `crud.py` – Funções de acesso ao banco de dados.
- `database.py` – Configuração do banco SQLite.
- `email_utils.py` – Utilitário para envio de e-mails via SMTP.
- `requirements.txt` – Dependências do backend.
- `achievements.db` – Banco de dados SQLite (criado automaticamente).

### Variáveis de Ambiente

Crie um arquivo `src/.env` com as seguintes variáveis (exemplo para Gmail):

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app
```

> **Importante:** Para Gmail, use uma "Senha de App" (não sua senha normal).

---

### Como Executar o Backend

1. **Acesse a pasta do projeto:**
   ```bash
   cd src
   ```

2. **Crie e ative um ambiente virtual:**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Linux/Mac
   ```

3. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure o arquivo `.env` conforme instruções acima.**

5. **Inicie o backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

6. **Acesse a documentação interativa:**
   - [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Frontend (React Native/Expo)

- O app pede o e-mail do usuário, envia o OTP, faz login e só então libera o jogo.
- Todas as requisições protegidas usam o token JWT no header `Authorization`.
- O endpoint da API é configurado em `app/env.js` via `ACHIEVEMENT_API_BASE_URL`.

### Como Executar o Frontend

1. **Acesse a pasta do app:**
   ```bash
   cd app
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn
   ```

3. **Inicie o app:**
   ```bash
   npx expo start
   ```

4. **Siga as instruções do Expo para rodar no emulador ou dispositivo físico.**

---

## Endpoints Principais do Backend

- `POST /auth/register-otp` – Registro de usuário e envio de OTP por e-mail.
- `POST /auth/request-otp` – Solicita novo OTP para login.
- `POST /auth/login-otp` – Valida OTP e retorna JWT.
- `GET /users/me/achievements` – Lista conquistas do usuário autenticado.
- `POST /users/me/achievements` – Desbloqueia conquista para o usuário autenticado.
- `GET /achievements` – Lista todas as conquistas possíveis.
- `GET /admin/all-achievements` – Lista todas as conquistas desbloqueadas por todos os usuários (admin).

---

## Observações

- O backend usa SQLite por padrão, mas pode ser adaptado para outros bancos.
- O envio de e-mail depende das credenciais corretas no `.env`.
- O frontend só libera o jogo após autenticação OTP/JWT.
- Para produção, configure variáveis de ambiente e endpoints adequados.

---

