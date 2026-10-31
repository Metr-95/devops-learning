# Architecture

This document describes the current repository layout and the local Docker Compose setup. It is based on the configuration committed in this repository; it does not describe any separate production VPS deployment.

## Components

- **Web frontend** — static HTML files served by Nginx.
- **API** — Node.js 18 application built from `api/Dockerfile`, using Express.
- **Persistent data** — the API stores entries and visit records as JSON files under `/data`.
- **Docker Compose** — starts the web and API containers and creates the named `poker-data` volume.

## Request and data flow

1. A browser requests the static frontend from the Nginx container.
2. The frontend sends API requests to the Node.js service.
3. The API reads and writes `/data/entries.json` and `/data/visits.json`.
4. The named Docker volume `poker-data` keeps these files outside the API container's writable layer.

## Local startup

From the repository root:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f
```

The Compose configuration currently publishes:

- Web frontend: host port `8080` → container port `80`.
- API: host port `3000` → container port `3000`.

Stop the stack with:

```bash
docker compose down
```

The named data volume is retained by the default `docker compose down`. To remove it as well, Docker requires the explicit `docker compose down --volumes` command; that deletes the persisted application data.

## Operational and security notes

This is a small learning application, not a production-hardened deployment. Before exposing it to the public internet:

- Restrict direct access to the API port. The current Compose file publishes port `3000` on the host.
- Add authentication and authorization to administrative/statistics endpoints.
- Replace unrestricted CORS with an explicit allowlist.
- Validate request bodies and handle malformed or unavailable JSON data safely.
- Add tested backups and a restore procedure for the `poker-data` volume.
- Review personal-data handling: visit records currently include IP address, approximate geolocation, page, and user-agent information.
- Put the public web service behind HTTPS using a properly configured reverse proxy.

## Configuration source

The deployment described here is defined by `docker-compose.yml`, `Dockerfile`, and `api/Dockerfile`. Keep this document in sync when those files change.
