"""
Módulo central de conexão com o PostgreSQL.

Todos os scripts de ETL (e futuramente a API) importam a função
`get_connection()` daqui em vez de escrever credenciais soltas em cada
arquivo. Isso significa que, quando você for publicar em produção, só
precisa trocar as variáveis no `.env` — nenhum código muda.
"""

import os
import sys
import logging
from pathlib import Path
import psycopg2
from dotenv import load_dotenv

log = logging.getLogger(__name__)

# Caminho explícito para o .env na raiz do projeto (um nível acima de
# backend/), em vez de deixar o python-dotenv "adivinhar" o diretório —
# essa adivinhação depende de como o processo Python foi iniciado e falha
# silenciosamente em alguns casos (ex: rodando um script solto direto,
# em vez de via `uvicorn`).
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_ENV_PATH)

REQUIRED_VARS = [
    "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD",
    "POSTGRES_HOST", "POSTGRES_PORT",
]


def _load_config() -> dict:
    """
    Carrega e valida a configuração de conexão a partir de variáveis de
    ambiente. Falha cedo (e com mensagem clara) se algo obrigatório estiver
    faltando — é melhor travar aqui do que a meio de um ETL de 5GB.
    """
    faltando = [v for v in REQUIRED_VARS if not os.getenv(v)]
    if faltando:
        log.error(
            "Variáveis de ambiente ausentes: %s. "
            "Procurei o .env em: %s — confira se ele existe e tem essas chaves.",
            ", ".join(faltando),
            _ENV_PATH,
        )
        sys.exit(1)

    return {
        "dbname": os.getenv("POSTGRES_DB"),
        "user": os.getenv("POSTGRES_USER"),
        "password": os.getenv("POSTGRES_PASSWORD"),
        "host": os.getenv("POSTGRES_HOST"),
        "port": os.getenv("POSTGRES_PORT"),
        # sslmode "require" em produção força conexão criptografada.
        # "disable" só deve ser usado em docker-compose 100% local.
        "sslmode": os.getenv("POSTGRES_SSLMODE", "require"),
    }


def get_connection():
    """Abre e retorna uma nova conexão psycopg2 com o banco configurado."""
    config = _load_config()
    return psycopg2.connect(**config)