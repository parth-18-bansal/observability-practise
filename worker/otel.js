const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } =
  require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } =
  require('@opentelemetry/exporter-trace-otlp-http');
const { PrometheusExporter } =
  require('@opentelemetry/exporter-prometheus');


