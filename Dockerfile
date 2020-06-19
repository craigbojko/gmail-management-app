FROM node:12

WORKDIR /app
COPY package.json /app
COPY . /app

RUN npm install

EXPOSE 1337

ENV NODE_ENV production

CMD ["npm", "start"]
