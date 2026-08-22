# ==========================================
# Stage 1: The Builder
# ==========================================
FROM python:3.11-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install heavy build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# ==========================================
# Stage 2: The Runner
# ==========================================
FROM python:3.11-slim as runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src:/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------
# SECURITY UPGRADE: Create a non-root user
# ---------------------------------------------------------
RUN addgroup --system appgroup && adduser --system --group appuser

# Copy compiled dependencies from the builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 10000

CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-10000}"]


