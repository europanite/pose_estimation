FROM node:20-bookworm
WORKDIR /app

ENV CI=1
ENV EXPO_NO_TELEMETRY=1

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 8081
CMD ["npm", "run", "web"]
