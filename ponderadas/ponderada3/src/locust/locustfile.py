import random
from locust import HttpUser, task, between

class RinhaUser(HttpUser):
    """
    Define o comportamento de um usuário para o teste de carga.
    Cada usuário simula a criação de transações e a consulta de extratos.
    """
    wait_time = between(0.1, 0.5)

    @task
    def criar_transacao_e_ver_extrato(self):
        """
        Tarefa principal que um usuário executará repetidamente.
        """
        cliente_id = random.randint(1, 5)

        self.client.post(
            f"/clientes/{cliente_id}/transacoes",
            json={
                "valor": random.randint(1, 10000),
                "tipo": "c",
                "descricao": "credito"
            },
            name="/clientes/[id]/transacoes (credito)"
        )

        self.client.post(
            f"/clientes/{cliente_id}/transacoes",
            json={
                "valor": random.randint(1, 5000),
                "tipo": "d",
                "descricao": "debito"
            },
            name="/clientes/[id]/transacoes (debito)"
        )

        self.client.get(
            f"/clientes/{cliente_id}/extrato",
            name="/clientes/[id]/extrato"
        )


