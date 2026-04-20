# ---- Build stage ----
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /rag-service ./cmd/server

# ---- Runtime stage ----
FROM gcr.io/distroless/static:nonroot

COPY --from=builder /rag-service /rag-service
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 9090

ENTRYPOINT ["/rag-service"]
