import type { AWS } from "@serverless/typescript";

import importProductsFile from "@functions/importProductsFile";
import importFileParser from "@functions/importFileParser";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
    stage: "dev",
  },
  useDotenv: true,
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-central-1",
    stage: "dev",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      BUCKET_REGION: process.env.BUCKET_REGION,
      BUCKET_NAME: process.env.BUCKET_NAME,
      UPLOAD_FOLDER: process.env.UPLOAD_FOLDER,
      SIGNED_URL_EXPIRATION: process.env.SIGNED_URL_EXPIRATION,
      CATALOG_ITEMS_QUEUE_URL:
        "${cf:product-service-${self:provider.stage}.catalogItemsQueueURL}",
    },
    lambdaHashingVersion: "20201221",
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["s3:ListBucket"],
            Resource: [`arn:aws:s3:::${process.env.BUCKET_NAME}`],
          },
          {
            Effect: "Allow",
            Action: ["s3:*"],
            Resource: [`arn:aws:s3:::${process.env.BUCKET_NAME}/*`],
          },
          {
            Effect: "Allow",
            Action: ["sqs:*"],
            Resource: [
              "${cf:product-service-${self:provider.stage}.catalogItemsQueueArn}",
            ],
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: {
    importFileParser,
    importProductsFile,
  },
};

module.exports = serverlessConfiguration;
