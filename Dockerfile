# Stage 1: Build
FROM node:22-alpine AS build

WORKDIR /app

# Copiar arquivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar codigo fonte
COPY . .

# Build da aplicacao
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Copiar configuracao customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar artefatos do build
COPY --from=build /app/dist/pet-manager/browser /usr/share/nginx/html

# Expor porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
