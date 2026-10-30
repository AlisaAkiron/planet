# syntax=docker/dockerfile:1
# Build from the repository root:
#   docker build -f apps/preview/Dockerfile -t planet-preview .

FROM node:26-alpine AS build
WORKDIR /repo
# Node 25+ no longer ships corepack; install the pnpm version the
# repository pins in packageManager.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g "$(node -p "require('./package.json').packageManager")"
# Manifests first, so dependency layers survive source-only changes.
COPY apps/preview/package.json apps/preview/
COPY packages/markdown/package.json packages/markdown/
COPY packages/theme/package.json packages/theme/
RUN pnpm install --frozen-lockfile --filter @planet/preview...
COPY packages packages
COPY apps/preview apps/preview
RUN pnpm --filter @planet/preview build

# The server build is a single bundle (ssr.noExternal) that starts its own
# listener when run directly (src/server.ts), so the runtime image needs
# only Node and dist/.
FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8787
COPY --from=build /repo/apps/preview/dist ./dist
USER node
EXPOSE 8787
CMD ["node", "dist/server/server.js"]
