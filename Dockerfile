FROM node:lts-alpine@sha256:bf6c61feabc1a1bd565065016abe77fa378500ec75efa67f5b04e5e5c4d447cd as development_dependencies
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
COPY package.json .
RUN pnpm install


FROM node:lts-alpine@sha256:bf6c61feabc1a1bd565065016abe77fa378500ec75efa67f5b04e5e5c4d447cd as production_dependencies
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
COPY package.json .
RUN pnpm install --prod

FROM node:lts-alpine@sha256:bf6c61feabc1a1bd565065016abe77fa378500ec75efa67f5b04e5e5c4d447cd as builder
WORKDIR /app
COPY --from=development_dependencies /app/package.json .
COPY --from=development_dependencies /app/node_modules ./node_modules
COPY . .
RUN npx tsc

FROM node:lts-alpine@sha256:bf6c61feabc1a1bd565065016abe77fa378500ec75efa67f5b04e5e5c4d447cd as final
WORKDIR /app
COPY --from=production_dependencies /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/dist ./dist

FROM final as runner
ENTRYPOINT ["node", "dist/index.js"]
