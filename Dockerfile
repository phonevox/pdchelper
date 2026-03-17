FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .

CMD ["bun", "src/deploy-commands.ts"]
CMD ["bun", "src/index.ts"]