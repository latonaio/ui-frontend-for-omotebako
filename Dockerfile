FROM node:10.21.0-slim

ENV POSITION=UI \
    SERVICE=ui-frontend-for-omotebako \
    AION_HOME=/var/lib/AION_HOME

RUN apt-get update && apt-get install -y \
    wget \
		gnupg \
		tzdata \
		curl \
&&  apt-get clean \
&&  rm -rf /var/lib/apt/lists/*

RUN mkdir -p ${AION_HOME}/$POSITION/$SERVICE
WORKDIR ${AION_HOME}/$POSITION/$SERVICE

EXPOSE 4000

ADD package.json .
RUN yarn

ADD . .
RUN mv .env.production .env

CMD ["yarn","start"]
