FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host: Docker 컨테이너 외부에서 접근 가능하도록 0.0.0.0 바인딩
CMD ["npm", "run", "dev"]
