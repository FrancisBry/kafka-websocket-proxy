FROM node:18-alpine as builder

RUN apk update && apk upgrade
RUN mkdir -p /src

WORKDIR /src

COPY package*.json ./
RUN npm install
COPY . /src

ENTRYPOINT node app.js