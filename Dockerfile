FROM node:22-alpine AS builder

# Install build tools for native dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY --from=builder /app ./
EXPOSE 3000
CMD ["pnpm", "start"]
