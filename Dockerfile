# ── Build stage: Node ────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Cache de dependências
COPY package.json package-lock.json ./
RUN npm ci

# Código + build
COPY . .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ── Runtime stage: nginx ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
