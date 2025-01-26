FROM nginx:latest
COPY /etc/nginx/app.conf /etc/nginx/conf.d/default.conf
COPY /etc/nginx/geostyle.crt /etc/nginx/geostyle.crt
COPY /etc/nginx/geostyle.key /etc/nginx/geostyle.key

EXPOSE 81