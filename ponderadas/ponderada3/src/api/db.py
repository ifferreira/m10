import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from flask import g

db_pool = SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=os.environ.get("DATABASE_URL")
)

def get_db():
    """Abre uma nova conexão com o banco de dados se não houver uma para o contexto atual."""
    if 'db' not in g:
        g.db = db_pool.getconn()
    return g.db

def close_db(e=None):
    """Fecha a conexão com o banco de dados."""
    db = g.pop('db', None)
    if db is not None:
        db_pool.putconn(db)



