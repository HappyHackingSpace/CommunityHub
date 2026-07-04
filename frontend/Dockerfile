# Development image: installs dependencies and runs the Next.js dev server.
# The docker compose stack builds this target for local development.
FROM node:24-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
