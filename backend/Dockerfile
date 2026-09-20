FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY pyproject.toml manage.py ./
COPY config ./config
COPY core_api ./core_api

RUN pip install --no-cache-dir .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
