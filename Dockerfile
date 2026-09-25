FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY access-denied.html case1.html case2.html case3.html home.html index.html style.css quest-access.js quest.js reveal.js /usr/share/nginx/html/

EXPOSE 8080
