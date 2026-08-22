"""
API — Busca, filtro e exportação de empresas.

MVP sem Meilisearch e sem fila assíncrona (corte de escopo combinado):
a busca consulta o Postgres diretamente, e a exportação usa streaming
de resposta HTTP (o CSV vai sendo gerado e enviado enquanto o Postgres
ainda está devolvendo linhas — não segura tudo em memória).

Rodar: uvicorn main:app --reload --port 8000
Depois: http://localhost:8000/docs (Swagger gerado automaticamente)
"""

import os
import csv
import io
import json
import sys
from pathlib import Path
from typing import Optional

import psycopg2
import psycopg2.extras
from fastapi import FastAPI, Query, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from .crm_store import connection as crm_connection, setup as setup_crm, row as crm_row, json_value

# Reaproveita o mesmo módulo de conexão do ETL — uma única fonte de
# verdade para a config do banco em todo o projeto.
from .db import get_connection  # noqa: E402

# Login/cadastro ficam por conta do Supabase Auth (frontend fala direto
# com o Supabase); aqui a gente só valida o token que ele emite.
from .auth import usuario_atual  # noqa: E402

load_dotenv()

# Conexão com o Postgres do Supabase, usada só pela tabela `profiles`
# (criada pelo SQL de setup). Pegue essa connection string em:
# Supabase > Project Settings > Database > Connection string (URI).
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")


def get_connection_supabase():
    if not SUPABASE_DB_URL:
        raise HTTPException(500, "SUPABASE_DB_URL não configurado no backend.")
    return psycopg2.connect(SUPABASE_DB_URL)

app = FastAPI(title="Leads Platform API", version="0.1.0")

# CORS liberado para o frontend local durante o desenvolvimento.
# Em produção: trocar pela URL real do frontend publicado.
# Ajuste/complete via variável de ambiente CORS_ALLOWED_ORIGINS se
# o Vite subir em outra porta (ele muda automaticamente quando a
# porta padrão já está ocupada).
ALLOWED_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://localhost:8082,http://127.0.0.1:8082",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)


@app.on_event("startup")
def iniciar_crm():
    setup_crm()

# Limite de segurança: mesmo autenticado, ninguém exporta mais que isso
# numa única chamada nesta primeira versão. Evita uma query descontrolada
# derrubar o banco. Pode virar plano pago depois ("exportar até 50k/mês"
# etc.) — aqui é só uma trava técnica.
LIMITE_MAXIMO_EXPORT = 100_000
TAMANHO_PAGINA_PADRAO = 50
TAMANHO_PAGINA_MAXIMO = 200


def montar_filtro_sql(
    uf: Optional[str],
    municipio: Optional[str],
    cnae: Optional[str],
    porte: Optional[str],
    razao_social: Optional[str],
    capital_social_min: Optional[float],
    matriz_filial: Optional[str] = None,
    natureza_juridica: Optional[str] = None,
    data_abertura_min: Optional[str] = None,
    data_abertura_max: Optional[str] = None,
    bairro: Optional[str] = None,
    cep: Optional[str] = None,
) -> tuple[str, list]:
    """
    Monta a cláusula WHERE dinamicamente, sempre com parâmetros ($1, $2...)
    — NUNCA concatenando valor de usuário direto na string SQL. Isso é o
    que impede SQL injection aqui.
    """
    condicoes = ["e.situacao_cadastral = '02'"]  # só ativas, sempre
    params = []

    if uf:
        params.append(uf.upper())
        condicoes.append(f"e.uf = %s")
    if municipio:
        # Aceita tanto o código oficial do município (RFB) quanto uma busca
        # por nome — a maioria dos usuários vai digitar o nome, não o código.
        if municipio.isdigit():
            params.append(municipio)
            condicoes.append(f"e.municipio = %s")
        else:
            params.append(f"%{municipio}%")
            condicoes.append(f"dm.descricao ILIKE %s")
    if cnae:
        params.append(cnae)
        condicoes.append(f"(e.cnae_fiscal_principal = %s OR %s = ANY(e.cnae_fiscal_secundario))")
        params.append(cnae)  # o mesmo valor é usado duas vezes na condição acima
    if porte:
        params.append(porte)
        condicoes.append(f"emp.porte_empresa = %s")
    if razao_social:
        params.append(f"%{razao_social}%")
        condicoes.append(f"emp.razao_social ILIKE %s")
    if capital_social_min is not None:
        params.append(capital_social_min)
        condicoes.append(f"emp.capital_social >= %s")
    if matriz_filial:
        # 1 = matriz, 2 = filial (código padrão da Receita Federal).
        # Coluna é smallint no banco — cast explícito pra evitar erro de
        # tipo (Postgres não compara smallint com texto implicitamente).
        try:
            valor_matriz_filial = int(matriz_filial)
        except ValueError:
            raise HTTPException(400, "matriz_filial deve ser 1 (matriz) ou 2 (filial).")
        params.append(valor_matriz_filial)
        condicoes.append(f"e.identificador_matriz = %s")
    if natureza_juridica:
        params.append(natureza_juridica)
        condicoes.append(f"emp.natureza_juridica = %s")
    if data_abertura_min:
        params.append(data_abertura_min)
        condicoes.append(f"e.data_inicio_atividade >= %s")
    if data_abertura_max:
        params.append(data_abertura_max)
        condicoes.append(f"e.data_inicio_atividade <= %s")
    if bairro:
        params.append(f"%{bairro}%")
        condicoes.append(f"e.bairro ILIKE %s")
    if cep:
        params.append(f"{cep.replace('-', '')}%")
        condicoes.append(f"REPLACE(e.cep, '-', '') LIKE %s")

    where_sql = " AND ".join(condicoes)
    return where_sql, params


FROM_BASE = """
    FROM estabelecimentos e
    JOIN empresas emp ON emp.cnpj_basico = e.cnpj_basico
    LEFT JOIN dom_cnae dc ON dc.codigo = e.cnae_fiscal_principal
    LEFT JOIN dom_municipio dm ON dm.codigo = e.municipio
"""

SELECT_BASE = f"""
    SELECT
        e.cnpj_completo AS cnpj, emp.razao_social, e.nome_fantasia,
        emp.capital_social, emp.porte_empresa AS porte,
        e.cnae_fiscal_principal, dc.descricao AS cnae_descricao,
        e.uf, dm.descricao AS municipio_descricao,
        e.logradouro, e.numero, e.bairro, e.cep,
        e.email, e.ddd1, e.telefone1,
        e.data_inicio_atividade
    {FROM_BASE}
"""


@app.get("/api/empresas")
def buscar_empresas(
    uf: Optional[str] = Query(None, description="Sigla do estado, ex: SP"),
    municipio: Optional[str] = Query(None, description="Código do município (padrão RFB)"),
    cnae: Optional[str] = Query(None, description="Código CNAE, 7 dígitos"),
    porte: Optional[str] = Query(None, description="00=Não informado 01=Microempresa 03=EPP 05=Demais"),
    razao_social: Optional[str] = Query(None, description="Busca parcial na razão social"),
    capital_social_min: Optional[float] = Query(None, ge=0),
    matriz_filial: Optional[str] = Query(None, description="1=Matriz 2=Filial"),
    natureza_juridica: Optional[str] = Query(None, description="Código da natureza jurídica"),
    data_abertura_min: Optional[str] = Query(None, description="Data de abertura mínima (AAAA-MM-DD)"),
    data_abertura_max: Optional[str] = Query(None, description="Data de abertura máxima (AAAA-MM-DD)"),
    bairro: Optional[str] = Query(None, description="Busca parcial no bairro"),
    cep: Optional[str] = Query(None, description="CEP ou prefixo do CEP"),
    pagina: int = Query(1, ge=1),
    tamanho_pagina: int = Query(TAMANHO_PAGINA_PADRAO, ge=1, le=TAMANHO_PAGINA_MAXIMO),
):
    """Busca paginada de empresas com os filtros informados."""

    where_sql, params = montar_filtro_sql(
        uf, municipio, cnae, porte, razao_social, capital_social_min,
        matriz_filial, natureza_juridica, data_abertura_min, data_abertura_max,
        bairro, cep,
    )
    offset = (pagina - 1) * tamanho_pagina

    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            # Contagem total — necessária pro frontend saber quantas páginas
            # existem. Em volumes muito grandes isso pode ficar lento; se
            # virar gargalo depois, trocamos por contagem aproximada.
            # Usa o mesmo FROM/JOINs da busca principal (inclusive o JOIN de
            # município), já que alguns filtros dependem dele.
            cur.execute(f"SELECT COUNT(*) AS total {FROM_BASE} WHERE {where_sql}", params)
            total = cur.fetchone()["total"]

            query = f"{SELECT_BASE} WHERE {where_sql} ORDER BY emp.capital_social DESC NULLS LAST LIMIT %s OFFSET %s"
            cur.execute(query, params + [tamanho_pagina, offset])
            resultados = cur.fetchall()
    finally:
        conn.close()

    return {
        "total": total,
        "pagina": pagina,
        "tamanho_pagina": tamanho_pagina,
        "resultados": resultados,
    }


@app.get("/api/empresas/export")
def exportar_empresas(
    uf: Optional[str] = Query(None),
    municipio: Optional[str] = Query(None),
    cnae: Optional[str] = Query(None),
    porte: Optional[str] = Query(None),
    razao_social: Optional[str] = Query(None),
    capital_social_min: Optional[float] = Query(None, ge=0),
    matriz_filial: Optional[str] = Query(None),
    natureza_juridica: Optional[str] = Query(None),
    data_abertura_min: Optional[str] = Query(None),
    data_abertura_max: Optional[str] = Query(None),
    bairro: Optional[str] = Query(None),
    cep: Optional[str] = Query(None),
):
    """
    Exporta os resultados filtrados como CSV, em streaming — o arquivo
    começa a ser enviado ao navegador enquanto o Postgres ainda está
    devolvendo linhas, então não seguramos milhares de linhas em memória
    de uma vez.
    """

    where_sql, params = montar_filtro_sql(
        uf, municipio, cnae, porte, razao_social, capital_social_min,
        matriz_filial, natureza_juridica, data_abertura_min, data_abertura_max,
        bairro, cep,
    )

    conn = get_connection()
    cur = conn.cursor(name="cursor_export")  # server-side cursor: o Postgres
    # entrega em lotes, em vez de mandar tudo de uma vez para o Python.
    cur.itersize = 5_000

    query = f"{SELECT_BASE} WHERE {where_sql} LIMIT {LIMITE_MAXIMO_EXPORT}"
    cur.execute(query, params)

    colunas = [
        "cnpj", "razao_social", "nome_fantasia", "capital_social", "porte",
        "cnae_principal", "cnae_descricao", "uf", "municipio",
        "logradouro", "numero", "bairro", "cep", "email", "ddd", "telefone",
        "data_inicio_atividade",
    ]

    def gerar_linhas():
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(colunas)
        yield buffer.getvalue()
        buffer.seek(0)
        buffer.truncate(0)

        for linha in cur:
            writer.writerow(linha)
            yield buffer.getvalue()
            buffer.seek(0)
            buffer.truncate(0)

        cur.close()
        conn.close()

    return StreamingResponse(
        gerar_linhas(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=empresas_export.csv"},
    )


@app.get("/api/perfil")
def obter_perfil(usuario: dict = Depends(usuario_atual)):
    """
    Perfil vem da tabela `profiles` do Supabase, uma linha por usuário
    (id = auth.uid()). Exige o header Authorization: Bearer <token>,
    emitido pelo Supabase no login.
    """
    conn = get_connection_supabase()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM profiles WHERE id = %s", (usuario["id"],))
            perfil = cur.fetchone()
    finally:
        conn.close()

    if not perfil:
        raise HTTPException(404, "Perfil não encontrado.")

    return {
        "empresa": {k: perfil.get(k) or "" for k in ("nome", "razao_social", "cnpj", "segmento", "telefone", "municipio", "uf")},
        "usuario": {"nome": perfil.get("nome") or "", "email": usuario.get("email") or "", "membro_desde": str(perfil.get("created_at") or "")},
        "plano": {"nome": perfil.get("plano", "standard"), "renovacao": "", "consultas_usadas": 0, "consultas_limite": 0, "exportacoes_usadas": 0, "exportacoes_limite": 0},
    }


@app.put("/api/perfil")
def atualizar_perfil(dados: dict = Body(...), usuario: dict = Depends(usuario_atual)):
    campos = {k: dados[k] for k in ("nome", "razao_social", "cnpj", "segmento", "telefone", "municipio", "uf", "plano") if k in dados}
    if campos.get("plano") not in (None, "standard", "pro"):
        raise HTTPException(422, "O plano deve ser standard ou pro.")
    if not campos:
        return obter_perfil(usuario)

    conn = get_connection_supabase()
    try:
        with conn.cursor() as cur:
            set_sql = ", ".join(f"{k} = %s" for k in campos)
            cur.execute(f"UPDATE profiles SET {set_sql} WHERE id = %s", list(campos.values()) + [usuario["id"]])
        conn.commit()
    finally:
        conn.close()

    return obter_perfil(usuario)


@app.get("/api/emails")
def listar_emails():
    with crm_connection() as conn:
        return [dict(item) | {"id": str(item["id"])} for item in conn.execute("SELECT * FROM emails ORDER BY enviado_em DESC").fetchall()]


@app.post("/api/emails")
def registrar_email(dados: dict = Body(...)):
    if not all(str(dados.get(k, "")).strip() for k in ("para", "assunto", "corpo")):
        raise HTTPException(422, "Para, assunto e corpo são obrigatórios.")
    with crm_connection() as conn:
        cur = conn.execute("INSERT INTO emails (para, assunto, corpo, status) VALUES (?, ?, ?, 'rascunho')", (dados["para"], dados["assunto"], dados["corpo"]))
        item = conn.execute("SELECT * FROM emails WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(item) | {"id": str(item["id"])}


@app.get("/api/anotacoes")
def listar_anotacoes():
    with crm_connection() as conn:
        return [dict(item) | {"id": str(item["id"]), "concluida": bool(item["concluida"])} for item in conn.execute("SELECT * FROM anotacoes ORDER BY concluida, prazo").fetchall()]


@app.patch("/api/anotacoes/{anotacao_id}")
def atualizar_anotacao(anotacao_id: int, dados: dict = Body(...)):
    with crm_connection() as conn:
        conn.execute("UPDATE anotacoes SET concluida = ? WHERE id = ?", (bool(dados.get("concluida")), anotacao_id))
    return {"id": str(anotacao_id), "concluida": bool(dados.get("concluida"))}


@app.get("/api/empresas/salvas")
def listar_empresas_salvas():
    with crm_connection() as conn:
        return [{"cnpj": item["cnpj"], "razao_social": item["cnpj"], "nome_fantasia": None, "uf": "", "municipio": "", "cnae_descricao": "", "salva_em": item["salva_em"], "tags": json.loads(item["tags"])} for item in conn.execute("SELECT * FROM empresas_salvas ORDER BY salva_em DESC").fetchall()]


@app.delete("/api/empresas/salvas/{cnpj}")
def remover_empresa_salva(cnpj: str):
    with crm_connection() as conn:
        conn.execute("DELETE FROM empresas_salvas WHERE cnpj = ?", (cnpj,))
    return {"cnpj": cnpj}


@app.get("/api/exportacoes")
def listar_exportacoes():
    with crm_connection() as conn:
        return [{**dict(item), "id": str(item["id"]), "filtros": json.loads(item["filtros"]), "download_url": ""} for item in conn.execute("SELECT * FROM exportacoes ORDER BY criada_em DESC").fetchall()]


@app.get("/api/socios")
def buscar_socios(termo: str = Query(..., min_length=2)):
    try:
        with get_connection() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""SELECT s.id::text, s.nome_socio AS nome, '***' AS cpf_parcial,
                COALESCE(q.descricao, s.qualificacao_socio) AS qualificacao, s.data_entrada_sociedade AS data_entrada,
                e.cnpj_completo AS empresa_cnpj, emp.razao_social AS empresa_razao_social, e.uf AS empresa_uf
                FROM socios s JOIN empresas emp ON emp.cnpj_basico=s.cnpj_basico
                JOIN estabelecimentos e ON e.cnpj_basico=s.cnpj_basico AND e.identificador_matriz=1
                LEFT JOIN dom_qualificacao_socio q ON q.codigo=s.qualificacao_socio
                WHERE s.nome_socio ILIKE %s LIMIT 100""", (f"%{termo}%",))
            return cur.fetchall()
    except psycopg2.errors.UndefinedTable:
        raise HTTPException(409, "Dados de sócios ainda não foram carregados.")


@app.get("/api/health")
def health():
    """Endpoint simples para checar se a API e o banco estão de pé."""
    try:
        conn = get_connection()
        conn.close()
        return {"status": "ok", "database": "conectado"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Banco indisponível: {e}")