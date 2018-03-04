FROM node:6

EXPOSE 3000
CMD ["node", "./bin/www"]
WORKDIR /app/cookbook-server
RUN mkdir /app/cookbook-server/data

ARG PROXY_URL
RUN npm set registry ${PROXY_URL:-https://registry.npmjs.org/}
ADD ./cookbook-server/package.json .
RUN npm install --production && rm package.json

ADD cookbook-server /app/cookbook-server
ADD cookbook-ui /app/cookbook-ui
