FROM node:8.6.0-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#Add project folders to work dir

ADD frontend/ /usr/src/app
ADD node_modules /usr/src/app
ADD package.json /usr/src/app
ADD test /usr/src/app
ADD xslt /usr/src/app
ADD bower.json /usr/src/app

#Install node packages
RUN npm install && bower install

EXPOSE 80

CMD [ "node", "app.js" ]