FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "from rembg import new_session; new_session()"

COPY . .

# Create data directories
RUN mkdir -p /app/uploads /app/mockups /app/data

EXPOSE 9004

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9004", "--reload"]
