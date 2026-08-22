"""Persistência local das funcionalidades de CRM (single-tenant no MVP)."""
import json
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(os.getenv("CRM_DATABASE_PATH", Path(__file__).with_name("crm.sqlite3")))


@contextmanager
def connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def setup() -> None:
    with connection() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS perfil (
          id INTEGER PRIMARY KEY CHECK (id = 1), nome TEXT NOT NULL, razao_social TEXT,
          cnpj TEXT, segmento TEXT, site TEXT, telefone TEXT, municipio TEXT, uf TEXT,
          usuario_nome TEXT, usuario_cargo TEXT, usuario_email TEXT, usuario_telefone TEXT,
          plano TEXT NOT NULL DEFAULT 'standard' CHECK (plano IN ('standard','pro'))
        );
        INSERT OR IGNORE INTO perfil (id,nome,plano) VALUES (1,'Minha empresa','standard');
        CREATE TABLE IF NOT EXISTS empresas_salvas (
          cnpj TEXT PRIMARY KEY, tags TEXT NOT NULL DEFAULT '[]', salva_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS emails (
          id INTEGER PRIMARY KEY AUTOINCREMENT, para TEXT NOT NULL, assunto TEXT NOT NULL,
          corpo TEXT NOT NULL, enviado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          status TEXT NOT NULL DEFAULT 'rascunho'
        );
        CREATE TABLE IF NOT EXISTS anotacoes (
          id INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT NOT NULL DEFAULT '',
          vinculo_tipo TEXT NOT NULL, vinculo_nome TEXT NOT NULL, vinculo_ref TEXT NOT NULL,
          prazo TEXT, concluida INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS exportacoes (
          id INTEGER PRIMARY KEY AUTOINCREMENT, criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          filtros TEXT NOT NULL, linhas INTEGER NOT NULL, arquivo TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'concluida'
        );
        """)


def row(data: sqlite3.Row | None):
    return dict(data) if data else None


def json_value(value: str):
    return json.loads(value) if value else []
