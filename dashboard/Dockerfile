# 使用 Node.js 16 的官方輕量 Alpine 映像
FROM node:20-alpine

# 安裝必要的構建工具
RUN apk add --no-cache build-base python3

# 設定工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json 以利用 Docker 建置的快取
COPY package*.json ./

# 在 Docker 容器中安裝依賴項
RUN npm install
RUN yarn install --pure-lockfile
RUN npm install vite@latest

# 複製當前目錄下的所有檔案到工作目錄
COPY . .

# 曝露應用程式埠
EXPOSE 5173 

# 啟動 Node.js 應用程式
CMD ["npm", "run", "start"]
