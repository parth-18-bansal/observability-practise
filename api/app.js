require('./otel');
const express = require('express');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const crypto = require('crypto');
const { register, httpRequestsTotal, httpRequestDuration, httpInFlight } = require('./metrics');

// creating sns client
const sns = new SNSClient({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,   // http://floci:4566
});

// app object
const app = express();
app.use(express.json());


// measure every request
// app.use((req, res, next) => {
//   const route = req.route?.path || req.path;     // low-cardinality label
//   const end = httpRequestDuration.startTimer({ route, method: req.method });
//   httpInFlight.inc({ route });
//   res.on('finish', () => {
//     const labels = { route, method: req.method, status: res.statusCode };
//     httpRequestsTotal.inc(labels);
//     end({ status: res.statusCode });          // observe duration w/ status
//     httpInFlight.dec({ route });
//   });
//   next();
// });

// middleware, measure request
app.use((req, res, next) => {
  if (req.path === '/metrics' || req.path === '/healthz') return next();

  const stopTimer = httpRequestDuration.startTimer();
  httpInFlight.inc();
  res.on('finish', () => {
    const route = req.route ? (req.baseUrl || '') + req.route.path : 'unmatched';
    const labels = { route, method: req.method, status: res.statusCode };
    httpRequestsTotal.inc(labels);
    stopTimer(labels);
    httpInFlight.dec();
  });
  next();
});


// scrape target
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});


// defining health check path
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// taking the order, validate it, and then create a json for it and publish that order in sns.
app.post('/orders', async (req, res) => {
  const { item, qty } = req.body || {};
  if (!item || !Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'item (string) and qty (int>=1) required' });
  }
  const order = { id: crypto.randomUUID(), item, qty, ts: Date.now() };
  await sns.send(new PublishCommand({
    TopicArn: process.env.TOPIC_ARN,
    Message: JSON.stringify(order),
  }));
  res.status(202).json({ accepted: true, order });
});

app.listen(8080, () => console.log('api listening on :8080'));