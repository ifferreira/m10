from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from . import models
from .database import engine, SessionLocal
from .routes import router

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Cria as tabelas no banco de dados (se não existirem)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Conquistas Duvido", version="1.0.0")

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas definidas no arquivo routes.py
app.include_router(router)

# Função para popular o banco com as conquistas padrão
def init_db():
    db = SessionLocal()
    DEFAULT_ACHIEVEMENTS = [
        {"code": "primeira_mentira", "name": "Primeira Mentira", "description": "Faça seu primeiro blefe bem-sucedido."},
        {"code": "cara_de_pau", "name": "Cara de Pau", "description": "Blefe com 4 ou mais cartas."},
        {"code": "detetive", "name": "Detetive", "description": "Pegue um bot em uma mentira grande."},
        {"code": "honestidade_brutal", "name": "Honestidade Brutal", "description": "Ganhe uma partida sem mentir."},
        {"code": "mestre_do_blefe", "name": "Mestre do Blefe", "description": "Ganhe uma partida mentindo em todas as jogadas."},
        {"code": "por_um_fio", "name": "Por um Fio", "description": "Ganhe a partida tendo apenas uma carta na mão."},
    ]
    for ach_data in DEFAULT_ACHIEVEMENTS:
        exists = db.query(models.Achievement).filter_by(code=ach_data["code"]).first()
        if not exists:
            db.add(models.Achievement(**ach_data))
    db.commit()
    db.close()

# Evento de startup para popular o banco
@app.on_event("startup")
def on_startup():
    init_db() 

