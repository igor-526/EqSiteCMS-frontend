FROM node:22-alpine AS builder
WORKDIR /app

# Принимаем build args
ARG NEXT_PUBLIC_BACKEND_URL
ARG PORT=5100
ARG SENTRY_ENABLED=false
ARG SENTRY_DSN=""
ARG SENTRY_ENVIRONMENT=""
ARG SENTRY_TRACES_SAMPLE_RATE=0
ARG SENTRY_RELEASE=""

# Устанавливаем переменные окружения ДО сборки
# Это важно, так как Next.js встраивает NEXT_PUBLIC_* во время сборки
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV PORT=${PORT}
ENV SENTRY_ENABLED=${SENTRY_ENABLED}
ENV SENTRY_DSN=${SENTRY_DSN}
ENV SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}
ENV SENTRY_TRACES_SAMPLE_RATE=${SENTRY_TRACES_SAMPLE_RATE}
ENV SENTRY_RELEASE=${SENTRY_RELEASE}

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app

# Принимаем PORT для runtime
ARG PORT=5100
ARG SENTRY_ENABLED=false
ARG SENTRY_DSN=""
ARG SENTRY_ENVIRONMENT=""
ARG SENTRY_TRACES_SAMPLE_RATE=0
ARG SENTRY_RELEASE=""
ENV PORT=${PORT}
ENV SENTRY_ENABLED=${SENTRY_ENABLED}
ENV SENTRY_DSN=${SENTRY_DSN}
ENV SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}
ENV SENTRY_TRACES_SAMPLE_RATE=${SENTRY_TRACES_SAMPLE_RATE}
ENV SENTRY_RELEASE=${SENTRY_RELEASE}

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE ${PORT}

# Next.js автоматически использует переменную окружения PORT
CMD ["npm", "start"]
