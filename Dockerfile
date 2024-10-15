# Sử dụng node image chính thức từ Docker Hub
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /var/www/

# Sao chép file package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt dependencies
RUN npm install -g pm2 && npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Expose cổng mà ứng dụng sử dụng
EXPOSE 8080

# Chạy ứng dụng bằng PM2
CMD ["pm2 start", "api.pm2.config.js"]
