FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g @nestjs/cli
COPY gateway-api/package*.json ./
RUN npm ci
COPY gateway-api/ .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV LITELLM_CONFIG_PATH=/app/litellm/config.yaml
COPY gateway-api/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY litellm/ ./litellm/
EXPOSE 3001
CMD ["node", "dist/src/main"]
