FROM golang:1.14 as builder

# Build the binary statically.
ENV CGO_ENABLED=0

WORKDIR /app
COPY back/go.* ./
RUN go mod download
COPY back/ .
RUN go build -o back .


FROM alpine:3.10.2

RUN apk add -U --no-cache ca-certificates
RUN mkdir -p /var/log/app

WORKDIR /app
COPY --from=builder /app/back .

CMD ["sh","-c","/app/back 2>&1 | tee -a /var/log/app/app.log"]
