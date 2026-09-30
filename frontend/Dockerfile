FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 7311

CMD ["npm", "run", "dev", "--", "--host"]
