#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Ch06Stack } from '../lib/ch06-stack';

const app = new cdk.App();
new Ch06Stack(app, 'Ch06Stack');
