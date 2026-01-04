FROM node:20-alpine

RUN apk add --no-cache redis

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000 6379

CMD redis-server --daemonize yes && node dist/main.js
