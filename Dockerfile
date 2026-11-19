# Etapa de build
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa final
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=build /app/dist/coffee-system-frontend ./dist/coffee-system-frontend
USER node
EXPOSE 4000
CMD ["node", "dist/coffee-system-frontend/server/server.mjs"]
