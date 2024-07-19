# Use an official Alpine Linux as a base image
FROM alpine:latest

# Install rsync
RUN apk update \
    && apk upgrade \
    && apk add --no-cache rsync openssh-client

CMD ["rsync"]