# Runner de pruebas. El navegador corre en el contenedor de Selenium (docker-compose.yml).
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=test \
    CI=true \
    HEADLESS=true \
    TZ=America/Mexico_City

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

COPY . .
RUN mkdir -p reports logs

CMD ["npm", "run", "suite"]
