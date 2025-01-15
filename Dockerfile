FROM node:20.18 AS base
ARG PORT=3000
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app

FROM base AS dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

FROM base AS build
COPY . .
COPY prisma ./prisma
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package-lock.json ./package-lock.json
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build


FROM base AS run
ENV NODE_ENV=production
ENV PORT=$PORT

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next


COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE $PORT

ENV HOSTNAME="0.0.0.0"
CMD ["npm", "run", "start"]