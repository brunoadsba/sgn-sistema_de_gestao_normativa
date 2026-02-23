FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    docker.io \
    python3 \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Crucial for Harbor agent injection
RUN mkdir -p /installed-agent && chmod 777 /installed-agent

# Dummy ENVs for build steps
ENV GROQ_API_KEY=dummy_key
ENV TURSO_DATABASE_URL=libsql://dummy.turso.io
ENV TURSO_AUTH_TOKEN=dummy_token
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files and install
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts

# Copy the rest of the application
COPY . .

CMD ["/bin/bash"]
