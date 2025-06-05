# docker/Dockerfile

# Stage 1: Install dependencies and build the Next.js application
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./

RUN npm ci

COPY . .

RUN rm -rf .next # ОЧЕНЬ ВАЖНО: УДАЛЯЕМ ПРЕДЫДУЩИЙ КЭШ СБОРКИ NEXT.JS ПЕРЕД НОВОЙ СБОРКОЙ

RUN npm run build


# Stage 2: Create the production image
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
