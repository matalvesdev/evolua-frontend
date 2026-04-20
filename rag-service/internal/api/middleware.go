package api

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/rs/zerolog/log"
	"golang.org/x/time/rate"
)

// contextKey is unexported to avoid collisions.
type contextKey string

const userIDKey contextKey = "user_id"

// UserIDFromContext retrieves the authenticated user ID from the request context.
func UserIDFromContext(ctx context.Context) string {
	v, _ := ctx.Value(userIDKey).(string)
	return v
}

// ---- JWT middleware ---------------------------------------------------------

// JWTMiddleware validates Bearer tokens signed with the shared JWT secret.
// On success it injects the subject (user UUID) into the request context.
func JWTMiddleware(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr := extractBearerToken(r)
			if tokenStr == "" {
				writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "missing or invalid Authorization header"})
				return
			}

			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, errors.New("unexpected signing method")
				}
				return []byte(secret), nil
			}, jwt.WithExpirationRequired())

			if err != nil || !token.Valid {
				writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid token"})
				return
			}

			sub, err := token.Claims.GetSubject()
			if err != nil || sub == "" {
				writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "token missing subject"})
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, sub)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func extractBearerToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if strings.HasPrefix(h, "Bearer ") {
		return strings.TrimPrefix(h, "Bearer ")
	}
	return ""
}

// ---- Rate limiter -----------------------------------------------------------

// rateLimiter holds per-IP limiters.
type rateLimiter struct {
	limiters map[string]*rate.Limiter
	r        rate.Limit
	b        int
	mu       chan struct{} // lightweight mutex via buffered channel
}

func newRateLimiter(r rate.Limit, b int) *rateLimiter {
	return &rateLimiter{
		limiters: make(map[string]*rate.Limiter),
		r:        r,
		b:        b,
		mu:       make(chan struct{}, 1),
	}
}

func (rl *rateLimiter) getLimiter(ip string) *rate.Limiter {
	rl.mu <- struct{}{}
	defer func() { <-rl.mu }()

	l, ok := rl.limiters[ip]
	if !ok {
		l = rate.NewLimiter(rl.r, rl.b)
		rl.limiters[ip] = l
	}
	return l
}

// RateLimitMiddleware returns a middleware that limits requests per IP.
// r = requests per second, b = burst size.
func RateLimitMiddleware(r rate.Limit, b int) func(http.Handler) http.Handler {
	rl := newRateLimiter(r, b)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			ip := realIP(req)
			if !rl.getLimiter(ip).Allow() {
				writeJSON(w, http.StatusTooManyRequests, map[string]string{"error": "rate limit exceeded"})
				return
			}
			next.ServeHTTP(w, req)
		})
	}
}

func realIP(r *http.Request) string {
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	if ips := r.Header.Get("X-Forwarded-For"); ips != "" {
		return strings.Split(ips, ",")[0]
	}
	return r.RemoteAddr
}

// ---- Request logging --------------------------------------------------------

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		ww := &responseWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(ww, r)
		log.Info().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Int("status", ww.status).
			Dur("latency", time.Since(start)).
			Str("ip", realIP(r)).
			Msg("http")
	})
}

type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}
