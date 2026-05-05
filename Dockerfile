FROM node:22-alpine AS builder
WORKDIR /app

# Принимаем build args
ARG NEXT_PUBLIC_BACKEND_URL
ARG PORT=5100

# Устанавливаем переменные окружения ДО сборки
# Это важно, так как Next.js встраивает NEXT_PUBLIC_* во время сборки
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV PORT=${PORT}

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app

# Принимаем PORT для runtime
ARG PORT=5100
ENV PORT=${PORT}

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

EXPOSE ${PORT}

# Next.js автоматически использует переменную окружения PORT
CMD ["npm", "start"]