import type { AWS } from '@serverless/typescript';
import * as dotenv from "dotenv";

dotenv.config({path: __dirname + '/.env'});
import { getItem, getItemList, catalogBatchProcess } from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '2',
  useDotenv: true,
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    region: 'eu-central-1',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: process.env.PG_HOST,
      PG_PORT: process.env.PG_PORT,
      PG_DATABASE:  process.env.PG_DATABASE,
      PG_USERNAME:  process.env.PG_USERNAME,
      PG_PASSWORD: process.env.PG_PASSWORD,
      SNS_REGION: 'eu-central-1',
      SNS_ARN: { Ref: 'SNSCatalogBatchProcessTopic' },
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: { Ref: 'SNSCatalogBatchProcessTopic' },
      },
    ],
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        },
      },
      SNSCatalogBatchProcessTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'catalog-batch-process-topic',
        },
      },
      SNSCatalogBatchProcessSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: process.env.EMAIL,
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSCatalogBatchProcessTopic',
          }
        },
      },
    },
    Outputs: {
      catalogItemsQueueArn: {
        Value: { 'Fn::GetAtt': ['catalogItemsQueue', 'Arn'] },
        Export: {
          Name: 'catalogItemsQueueArn',
        },
      },
      catalogItemsQueueURL: {
        Value: { Ref: 'catalogItemsQueue' },
        Export: {
          Name: 'catalogItemsQueueURL',
        },
      },
    },
  },
  functions: { getItem, getItemList, catalogBatchProcess },
};

module.exports = serverlessConfiguration;
