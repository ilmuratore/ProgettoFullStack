FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# --host 0.0.0.0 → obbligatorio in Docker per esporre Vite fuori dal container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
