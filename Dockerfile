# Stage 1: Build static assets in GitHub Actions runner
FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=https://api-pos.vimtk.cloud/api/v1
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod 755 / && chmod -R 755 /usr/share/nginx/html
EXPOSE 80
CMD ["sh", "-c", "chmod 755 / && nginx -g 'daemon off;'"]
