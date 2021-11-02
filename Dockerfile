FROM node:14.17.3-slim as build-stage

ENV POSITION=UI \
    SERVICE=ui-frontend-for-omotebako \
    AION_HOME=/var/lib/AION_HOME

RUN apt-get update && apt-get install -y \
    wget \
		gnupg \
		tzdata \
&&  apt-get clean \
&&  rm -rf /var/lib/apt/lists/*

RUN mkdir -p ${AION_HOME}/$POSITION/$SERVICE
WORKDIR ${AION_HOME}/$POSITION/$SERVICE

ADD package.json .
RUN yarn install

ADD . .
RUN mv .env.production .env

<<<<<<< HEAD
CMD ["yarn","start"]
=======
RUN yarn export


FROM nginx:stable-alpine

RUN mkdir -p /usr/share/nginx/html

ENV POSITION=UI \
    SERVICE=ui-frontend-for-omotebako \
    AION_HOME=/var/lib/AION_HOME

COPY --from=build-stage ${AION_HOME}/$POSITION/$SERVICE/out /usr/share/nginx/html

ADD etc/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

EXPOSE 3000

CMD [ "nginx", "-g", "daemon off;" ]
>>>>>>> 6b1ea890... change root Dockerfile for production
