require('./otel');
const express = require('express');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');