FROM node:10.21.0-slim AS build-stage

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

RUN yarn run build

FROM nginx:stable-alpine

RUN mkdir -p /usr/share/nginx/html

ENV POSITION=UI \
    SERVICE=ui-frontend-for-omotebako \
    AION_HOME=/var/lib/AION_HOME

COPY --from=build-stage ${AION_HOME}/$POSITION/$SERVICE/build /usr/share/nginx/html

ADD etc/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

EXPOSE 4000

CMD [ "nginx", "-g", "daemon off;" ]
