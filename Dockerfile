FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/shop.sqlite

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/main"]
