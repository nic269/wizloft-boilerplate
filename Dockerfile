FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS pruner
ARG APP_SCOPE=@repo/app
RUN pnpm add --global turbo@^2.9.6
COPY . .
RUN turbo prune "${APP_SCOPE}" --docker

FROM base AS installer
ARG APP_SCOPE=@repo/app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter="${APP_SCOPE}"

FROM base AS runner
ARG APP_SCOPE=@repo/app
ENV NODE_ENV=production
ENV APP_SCOPE=${APP_SCOPE}
RUN addgroup -S app && adduser -S app -G app
COPY --from=installer --chown=app:app /app /app
USER app
CMD ["sh", "-c", "pnpm --filter \"$APP_SCOPE\" start"]
