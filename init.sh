#!/usr/bin/env bash
set -euo pipefail

# 1) SNS topic
TOPIC_ARN=$(aws sns create-topic --name orders --query TopicArn --output text)

# 2) SQS queue + its ARN
$AWSLOCAL sqs create-queue --queue-name orders-queue >/dev/null
QURL=$(aws sqs get-queue-url --queue-name orders-queue --query QueueUrl --output text)
QARN=$(aws sqs get-queue-attributes --queue-url "$QURL" \
        --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)

# 3) Subscribe the queue to the topic (raw delivery off → SNS envelope)
aws sns subscribe --topic-arn "$TOPIC_ARN" \
  --protocol sqs --notification-endpoint "$QARN" >/dev/null

# 4) Result bucket
aws s3 mb s3://order-results

echo "topic=$TOPIC_ARN"
echo "queue=$QURL"
echo "bucket=order-results  ✔ provisioned"
