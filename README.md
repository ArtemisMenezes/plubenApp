# Plataforma de Inteligência de Mercado — Setup Inicial

Pipeline de ETL para carregar dados públicos de CNPJ (Receita Federal) e
dívida ativa (PGFN) em um PostgreSQL, como base para busca/exportação de
leads B2B.

## Estrutura

```
leads-platform/
├── db/
│   └── schema.sql          # tabelas + role de aplicação (não-superusuário)
├── etl/
│   ├── db.py                # conexão central, lê config do .env
│   └── etl_estabelecimentos.py
├── dados/                   # coloque aqui os CSVs baixados da RFB (git-ignorado)
├── docker-compose.yml       # Postgres local para desenvolvimento
├── .env.example
└── requirements.txt
```

## Setup local (desenvolvimento)

1. **Copie as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   Edite o `.env` e defina uma senha em `POSTGRES_PASSWORD` e
   `POSTGRES_ADMIN_PASSWORD` (pode gerar com `openssl rand -base64 32`).
   Para uso 100% local via Docker, deixe `POSTGRES_SSLMODE=disable`.

2. **Suba o Postgres:**
   ```bash
   docker compose up -d
   ```

3. **Instale as dependências Python:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Crie as tabelas e a role de aplicação** (conecta como admin, definido
   no `.env`):
   ```bash
   psql "host=localhost port=5432 dbname=leads_platform user=postgres password=SUA_SENHA_ADMIN" -f db/schema.sql
   ```
   > Atualize a senha da role `leads_app` criada pelo `schema.sql` para
   > bater com o valor que você colocou em `POSTGRES_PASSWORD` no `.env`:
   > ```sql
   > ALTER ROLE leads_app WITH PASSWORD 'sua_senha_do_env';
   > ```

5. **Baixe o dump completo, direto da Receita Federal** (as dez partes de
   Empresas e as dez de Estabelecimentos):
   ```bash
   python etl/baixar_cnpj_rfb.py --somente tudo
   ```
   A fonte é o conjunto catalogado no [dados.gov.br](https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj);
   o script baixa os ZIPs no repositório oficial da Receita e os extrai em
   `dados/`. Para concluir uma carga já iniciada, use somente as partes que
   faltam, por exemplo `--somente estabelecimentos`.

6. **Rode o ETL:**
   ```bash
   python etl/etl_dominios.py --dados-dir dados
   python etl/etl_empresas.py dados
   python etl/etl_estabelecimentos.py dados
   ```
   Os dois últimos comandos processam automaticamente todas as partes `0` a
   `9`, em vez de apenas a primeira. A carga é idempotente: pode ser retomada
   sem duplicar CNPJs.

## Checklist antes de publicar em produção

- [ ] Banco de dados gerenciado (Neon/Supabase/RDS/Cloud SQL) em vez de
      Postgres self-hosted — backups e patches automáticos.
- [ ] `POSTGRES_SSLMODE=require` (nunca `disable` fora do ambiente local).
- [ ] Porta do banco **não exposta** publicamente — só acessível pela rede
      interna da aplicação ou por IP allowlist.
- [ ] Aplicação conecta com a role `leads_app` (sem privilégios de admin),
      nunca com o usuário `postgres`.
- [ ] Segredos (`.env`) vivem num gerenciador de secrets do provedor de
      hospedagem, não em arquivo texto no servidor.
- [ ] Rotina de backup testada (não basta configurar — teste a restauração).
- [ ] Rate limiting e autenticação na API antes de expor os endpoints de
      busca/exportação (evita scraping em massa da base).
- [ ] Política de privacidade / tratamento de dado pessoal (CPF/nome de
      sócio, telefone) para conformidade com a LGPD, mesmo a fonte sendo
      pública.

## Próximos passos do pipeline

- [ ] ETL das tabelas de domínio (CNAE, Município, Natureza Jurídica etc.)
- [ ] ETL de Empresas e Sócios
- [ ] ETL da base da PGFN (Devedores da União/FGTS)
- [ ] Reindexação para Meilisearch
- [ ] API (FastAPI) com autenticação e endpoints de busca/exportação
