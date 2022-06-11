FROM node:14.16-alpine AS node

ENV NODE_VERSION 14.16.1

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

CMD ["npm","start"]