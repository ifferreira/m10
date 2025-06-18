import os
from flask import Flask, request, jsonify, g
from datetime import datetime
from . import db

app = Flask(__name__)

app.teardown_appcontext(db.close_db)

@app.route('/clientes/<int:cliente_id>/transacoes', methods=['POST'])
def criar_transacao(cliente_id):
    dados = request.get_json()

    if not dados or 'valor' not in dados or 'tipo' not in dados or 'descricao' not in dados:
        return "Dados inválidos", 422
    
    valor = dados['valor']
    tipo = dados['tipo']
    descricao = dados['descricao']

    if not isinstance(valor, int) or valor <= 0:
        return "Valor inválido", 422
    if tipo not in ['c', 'd']:
        return "Tipo de transação inválido", 422
    if not isinstance(descricao, str) or len(descricao) > 10 or len(descricao) == 0:
        return "Descrição inválida", 422
    if cliente_id > 5 or cliente_id < 1:
        return "Cliente não encontrado", 404
    
    conn = db.get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT saldo, limite FROM clientes WHERE id = %s FOR UPDATE", (cliente_id,))
        cliente = cursor.fetchone()

        if not cliente:
            conn.rollback()
            return "Cliente não encontrado", 404

        saldo_atual, limite = cliente

        if tipo == 'd':
            if saldo_atual - valor < -limite:
                conn.rollback()
                return "Saldo insuficiente", 422
            novo_saldo = saldo_atual - valor
        else:
            novo_saldo = saldo_atual + valor

        cursor.execute(
            "UPDATE clientes SET saldo = %s WHERE id = %s",
            (novo_saldo, cliente_id)
        )
        cursor.execute(
            "INSERT INTO transacoes (cliente_id, valor, tipo, descricao) VALUES (%s, %s, %s, %s)",
            (cliente_id, valor, tipo, descricao)
        )
        
        conn.commit()

        return jsonify({"limite": limite, "saldo": novo_saldo}), 200

    except Exception as e:
        conn.rollback()
        return f"Erro interno no servidor: {e}", 500
    finally:
        cursor.close()

@app.route('/clientes/<int:cliente_id>/extrato', methods=['GET'])
def obter_extrato(cliente_id):
    if cliente_id > 5 or cliente_id < 1:
        return "Cliente não encontrado", 404

    conn = db.get_db()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT c.saldo, c.limite, t.valor, t.tipo, t.descricao, t.realizada_em
            FROM clientes c
            LEFT JOIN transacoes t ON c.id = t.cliente_id
            WHERE c.id = %s
            ORDER BY t.realizada_em DESC
            LIMIT 10;
            """,
            (cliente_id,)
        )
        
        transacoes_db = cursor.fetchall()
        
        if not transacoes_db:
            cursor.execute("SELECT saldo, limite FROM clientes WHERE id = %s", (cliente_id,))
            cliente_sem_transacao = cursor.fetchone()
            if not cliente_sem_transacao:
                return "Cliente não encontrado", 404
            
            saldo_atual, limite = cliente_sem_transacao
            ultimas_transacoes = []
        else:
            saldo_atual = transacoes_db[0][0]
            limite = transacoes_db[0][1]

            ultimas_transacoes = [
                {
                    "valor": r[2],
                    "tipo": r[3],
                    "descricao": r[4],
                    "realizada_em": r[5].isoformat() + "Z"
                } for r in transacoes_db if r[2] is not None
            ]


        extrato = {
            "saldo": {
                "total": saldo_atual,
                "data_extrato": datetime.now().isoformat() + "Z",
                "limite": limite
            },
            "ultimas_transacoes": ultimas_transacoes
        }

        return jsonify(extrato), 200

    except Exception as e:
        return f"Erro interno no servidor: {e}", 500
    finally:
        cursor.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=os.environ.get("PORTA_API", 8080))

