# Observabilidade Evolua

Stack local/open-source: Grafana, Prometheus, Loki e Tempo. Execute com
`docker compose --env-file .env -f observability/docker-compose.yml up -d`.

Nunca inclua dados clínicos, IDs de paciente, transcrições, prompts ou tokens em
métricas, logs e traces. Em produção, hospede os componentes em rede privada e
injete `EVOLUA_INTERNAL_SERVICE_TOKEN` por secret manager.
