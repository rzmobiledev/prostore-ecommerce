FROM node:22.13.0-alpine AS base
RUN apk update && apk add --no-cache g++ make py3-pip libc6-compat \
&& apk add --no-cache bash && apk add -y openssl

FROM node:22.13.0-alpine AS build
WORKDIR /app
COPY . .
RUN npx prisma generate \
&& npm run build && npm prune --production

FROM node:22.13.0-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
&& adduser --system --uid 1001 nextjs \
&& mkdir .next \
&& chown nextjs:nodejs .next


COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
CMD ["npm", "run", "start"]