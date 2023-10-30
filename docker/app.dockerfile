FROM node

WORKDIR /
COPY . .

RUN npm install pm2 -g
ENV PM2_PUBLIC_KEY l9mxdnnyle76r0a
ENV PM2_SECRET_KEY ndhr1ktk7kuupg8

CMD ["npm", "start"]