# Token Search Backend

### Description

This application provides an API for searching trading tokens by their address, trading pair, or name.
The data is retrieved through integration with the Dexscreener API, and the results are cached in Redis for improved performance.

### Technologies

- **NodeJS** + **TypeScript**
- **NestJS**
- **Redis**
- **Docker** + **Docker Compose**
- **OpenTelemetry** (for distributed tracing and metrics)
- **Prometheus** (for metrics collection)
- **Jaeger** (for distributed tracing)

---

## Project setup

### Locally

1. Make sure you have **Node.js** (>= 20) and **yarn** installed.
2. Install dependencies:

```bash
$ yarn install
```

3. Create a .env file based on .env.example and specify your settings.
4. Start Redis (you can do this via Docker):

```bash
$ docker run --name search-bar-redis -p 6379:6379 -d redis:7.0
```

5. Run the application:

```bash
$ yarn start:dev
```

### Via Docker

1. Make sure you have Docker and Docker Compose installed.
2. Create a .env file based on .env.example and specify your settings.
3. Run the containers:

```bash
$ docker-compose -f docker-compose.yaml up -d --build
```

The API(Swagger) will be available at: http://localhost:3000/api/docs.

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test
```

## Example of requests

![alt text](swagger_example.png)

## Metrics

This project uses **OpenTelemetry** for collecting metrics and traces. The following telemetry services are set up:

### Prometheus Metrics

- Metrics are exposed on the following endpoint: http://localhost:9464/metrics.
- You can view your metrics in **Prometheus** at http://localhost:9090.
- Make sure Prometheus is configured to scrape metrics from the backend (refer to `prometheus.yml`).

### Jaeger Tracing

- Distributed traces are sent to **Jaeger** and are available at http://localhost:16686.
- **Jaeger** UI provides insights into the application's traces, which allows you to monitor and debug the flow of requests across different services.
- Service name: `search-bar-backend`
- You can see traces related to various operations like searchTokens in the **Jaeger** interface.

## TODO

1. Implement additional metrics (e.g., error counts, latencies).
2. Improve error handling and logging.
3. Add support for other APIs besides Dexscreener.
4. Implement additional tests.
