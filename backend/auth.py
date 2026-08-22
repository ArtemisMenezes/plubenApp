"""
Verificação de sessão do Supabase nas rotas do FastAPI.

O frontend manda o access_token do Supabase no header:
    Authorization: Bearer <token>

Aqui a gente só valida a assinatura com o JWT Secret do projeto
(Project Settings > API > JWT Secret) — não precisa chamar o
Supabase pela rede a cada request.
"""

import os
import jwt
from fastapi import Header, HTTPException

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")


def usuario_atual(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Token ausente. Faça login novamente.")

    token = authorization.removeprefix("Bearer ").strip()

    if not SUPABASE_JWT_SECRET:
        raise HTTPException(500, "SUPABASE_JWT_SECRET não configurado no backend.")

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Sessão expirada. Faça login novamente.")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token inválido.")

    return {"id": payload["sub"], "email": payload.get("email")}