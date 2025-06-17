import smtplib
from email.message import EmailMessage
import os

def send_otp_email(email_to: str, otp: str):
    email_user = os.getenv("EMAIL_USER")
    email_password = os.getenv("EMAIL_PASSWORD")
    email_host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    email_port = int(os.getenv("EMAIL_PORT", 587))

    if not all([email_user, email_password]):
        print("Credenciais de e-mail não configuradas. Pulando envio de e-mail.")
        return

    subject = "Seu código de acesso para o Jogo Duvido"
    body = f"""
        <p>Olá,</p>
        <p>Seu código de acesso é: <strong>{otp}</strong></p>
        <p>Este código é válido por alguns minutos.</p>
    """

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = email_user
    msg['To'] = email_to
    msg.set_content(body, subtype='html')

    try:
        with smtplib.SMTP(email_host, email_port) as s:
            s.starttls()
            s.login(email_user, email_password)
            s.send_message(msg)
            print(f"E-mail de OTP enviado para {email_to}")
    except Exception as e:
        print(f"Falha ao enviar e-mail: {e}") 