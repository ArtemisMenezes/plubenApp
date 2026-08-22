"""
Lista as colunas da tabela `estabelecimentos` (e de `empresas`, já que
usamos as duas). Roda com o mesmo Python/venv do backend, a partir da
RAIZ do projeto (C:\\pluben-plataforma):

    .\\.venv\\Scripts\\python.exe listar_colunas.py

Usa a mesma config do .env que o backend/db.py já lê (POSTGRES_HOST,
POSTGRES_PORT etc.), então não precisa editar nada aqui.
"""

from backend.db import get_connection

TABELAS = ["estabelecimentos", "empresas", "socios"]

conn = get_connection()
try:
    with conn.cursor() as cur:
        for tabela in TABELAS:
            cur.execute(
                """
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = %s
                ORDER BY ordinal_position
                """,
                (tabela,),
            )
            linhas = cur.fetchall()
            print(f"\n=== {tabela} ({len(linhas)} colunas) ===")
            if not linhas:
                print("  (tabela não encontrada — nome errado ou schema diferente?)")
            for nome, tipo in linhas:
                print(f"  {nome}: {tipo}")
finally:
    conn.close()