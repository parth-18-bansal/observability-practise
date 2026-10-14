#! /usr/bin/env bash

set -euo pipefail

while true; do
  curl -s -o /dev/null -X POST http://localhost:8080/orders \
    -H 'content-type: application/json' \
    -d '{"item":"SKU-42","qty":2}'
  # occasionally send a bad order to create 4xx/5xx
  [ $((RANDOM % 10)) -eq 0 ] && curl -s -o /dev/null -X POST \
    http://localhost:8080/orders -d '{"bad":true}'
  sleep 0.1
done

# hey -z 60s -c 20 -m POST \
#   -H 'content-type: application/json' \
#   -d '{"item":"SKU-42","qty":2}' \
#   http://localhost:8080/orders