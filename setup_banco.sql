-- 1. Criar a extensão essencial para buscas rápidas de texto (milissegundos)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Criar a Tabela Exata para receber o CSV da Receita Federal
CREATE TABLE estabelecimentos (
    cnpj_basico VARCHAR(8),
    cnpj_ordem VARCHAR(4),
    cnpj_dv VARCHAR(2),
    identificador_matriz_filial VARCHAR(1),
    nome_fantasia VARCHAR(255),
    situacao_cadastral VARCHAR(2),
    data_situacao_cadastral VARCHAR(8),
    motivo_situacao_cadastral VARCHAR(2),
    nome_cidade_exterior VARCHAR(255),
    pais VARCHAR(3),
    data_inicio_atividade VARCHAR(8),
    cnae_fiscal_principal VARCHAR(7),
    cnae_fiscal_secundaria TEXT,
    tipo_logradouro VARCHAR(255),
    logradouro VARCHAR(255),
    numero VARCHAR(255),
    complemento VARCHAR(255),
    bairro VARCHAR(255),
    cep VARCHAR(8),
    uf VARCHAR(2),
    municipio VARCHAR(4),
    ddd_1 VARCHAR(4),
    telefone_1 VARCHAR(8),
    ddd_2 VARCHAR(4),
    telefone_2 VARCHAR(8),
    ddd_fax VARCHAR(4),
    fax VARCHAR(8),
    correio_eletronico VARCHAR(255),
    situacao_especial VARCHAR(255),
    data_situacao_especial VARCHAR(8)
);

-- 3. O Comando de Importação (Você rodará depois, apontando para o seu CSV)
-- COPY estabelecimentos FROM '/caminho/do/seu/estabelecimentos_ativos_brasil.csv' DELIMITER ';' CSV;

-- 4. Criar os Índices Mágicos (O Segredo para não dar Timeout no Vercel)
-- Busca rápida pelo CNPJ exato
CREATE INDEX idx_cnpj_basico ON estabelecimentos (cnpj_basico);

-- Busca rápida quando o usuário digitar partes do nome (ex: "Padaria")
CREATE INDEX idx_nome_fantasia_trgm ON estabelecimentos USING gin (nome_fantasia gin_trgm_ops);

-- Busca rápida por Estado e Bairro (Filtros comuns no app)
CREATE INDEX idx_uf_municipio ON estabelecimentos (uf, municipio);

