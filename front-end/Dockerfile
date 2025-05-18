# 使用 Node.js 20 的官方輕量 Alpine 映像
FROM node:16-alpine

# 安裝必要的構建工具和依賴項
RUN apk add --no-cache build-base python3 libc6-compat

# 設定工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json 以利用 Docker 建置的快取
COPY package*.json ./

# 安裝 Node.js 專案的依賴項
RUN npm install
RUN npm install esbuild
RUN npm install marked
# RUN npm install next-auth@latest
RUN npm install openid-client@latest

# 複製當前目錄下的所有檔案到工作目錄
COPY . .

# 曝露應用程式埠
EXPOSE 7230 24678

# 啟動 Node.js 應用程式
CMD ["npm", "run", "start"]
