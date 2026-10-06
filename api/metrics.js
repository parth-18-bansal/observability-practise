const client = require('prom-client');

// here we are creating a registry of name register. registry is place where prom-client will collect the metrics
const register = new client.Registry();

// it will register the default metrics like cpu, memory, etc in the register registery
client.collectDefaultMetrics({ register });

// counter is a type of metric that increase
// here we are defining a metric http_request_total of type counter, and it has dimensions (route, method, status)
// it will be stored in register registy.
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['route', 'method', 'status'],
  registers: [register] 
});


// here we are creating a metric of type histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['route', 'method', 'status'],
  // buckets bracket our SLO (~250ms) and the tail
  buckets: [0.005,0.01,0.025,0.05,0.1,0.25,0.5,1,2.5,5],
  registers: [register] 
});


// here we are creating a metric of type gauge
const httpInFlight = new client.Gauge({
  name: 'http_requests_in_flight',
  help: 'In-flight HTTP requests',
  labelNames: ['route'],   
  registers: [register] 
});


module.exports = { register, httpRequestsTotal, httpRequestDuration, httpInFlight };