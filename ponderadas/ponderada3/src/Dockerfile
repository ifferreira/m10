FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir Flask gunicorn psycopg2-binary

COPY ./api /app

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "4", "app:app"]


