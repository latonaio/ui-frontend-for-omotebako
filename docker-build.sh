#!/bin/sh

PUSH=$1
DATE="$(date "+%Y%m%d%H%M")"
REPOSITORY_PREFIX="latonaio"
SERVICE_NAME="ui-frontend-for-omotebako"

if [[ $PUSH == "production" ]]; then
    docker build -t ${SERVICE_NAME}:"${DATE}" -f docker/production/Dockerfile .
else
    docker build -t ${SERVICE_NAME}:"${DATE}" .
fi

# DOCKER_BUILDKIT=1 docker build --progress=plain -t ${SERVICE_NAME}:"${DATE}" .

# tagging
docker tag ${SERVICE_NAME}:"${DATE}" ${SERVICE_NAME}:latest
docker tag ${SERVICE_NAME}:"${DATE}" ${REPOSITORY_PREFIX}/${SERVICE_NAME}:"${DATE}"
docker tag ${REPOSITORY_PREFIX}/${SERVICE_NAME}:"${DATE}" ${REPOSITORY_PREFIX}/${SERVICE_NAME}:latest

if [[ $PUSH == "push" ]]; then
    docker push ${REPOSITORY_PREFIX}/${SERVICE_NAME}:"${DATE}"
    docker push ${REPOSITORY_PREFIX}/${SERVICE_NAME}:latest
fi
