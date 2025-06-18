CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    limite INTEGER NOT NULL,
    saldo INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE transacoes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    valor INTEGER NOT NULL,
    tipo CHAR(1) NOT NULL,
    descricao VARCHAR(10) NOT NULL,
    realizada_em TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_clientes_transacoes_id
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

INSERT INTO clientes (id, limite, saldo)
VALUES
    (1, 100000, 0),
    (2, 80000, 0),
    (3, 1000000, 0),
    (4, 10000000, 0),
    (5, 500000, 0);

