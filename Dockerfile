FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p /app/session

CMD ["npm", "start"]
