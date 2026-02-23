FROM node:20-slim

RUN apt-get update && apt-get install -y git curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts
