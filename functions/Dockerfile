FROM node:22-slim AS build
WORKDIR /app
COPY functions/package.json functions/package-lock.json ./functions/
RUN cd functions && npm ci
COPY functions/tsconfig.json ./functions/
COPY functions/src/ ./functions/src/
COPY shared/ ./shared/
RUN cd functions && npx tsc

FROM node:22-slim
WORKDIR /app
COPY --from=build /app/functions/package.json /app/functions/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/functions/dist/ ./dist/
ENV PORT=8080
CMD ["npx", "functions-framework", "--target=api", "--source=dist/functions/src"]
