#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';
import { config } from 'dotenv';

config();

const app = new cdk.App();
new InfraStack(app, 'InfraStack', {
  owner: process.env.github_owner || '',
  repo: process.env.github_repo || '',
  branch: process.env.github_branch || 'main',
  oauthToken: process.env.github_oauth_token || '',
});
