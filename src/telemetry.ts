import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';


export const setupOpenTelemetry = async () => {
    const traceExporterUrl = process.env.OTLP_EXPORTER_URL || 'http://search-bar-jaeger:4318/v1/traces';
    const prometheusPort = process.env.PROMETHEUS_EXPORTER_PORT || '9464';
    const serviceName = process.env.SERVICE_NAME || 'search-bar-backend';

    const traceExporter = new OTLPTraceExporter({
        url: traceExporterUrl,
    });

    const metricsExporter = new PrometheusExporter({
        preventServerStart: false,
        port: parseInt(prometheusPort, 10),
    });

    console.log(`Prometheus metrics available at http://localhost:${prometheusPort}/metrics`);

    const sdk = new NodeSDK({
        traceExporter,
        metricReader: metricsExporter,
        instrumentations: [getNodeAutoInstrumentations()],
        resource: new Resource({
            [ATTR_SERVICE_NAME]: serviceName,
        }),
    });

    await sdk.start();
    console.log('OpenTelemetry initialized');
};