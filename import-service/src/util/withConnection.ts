import { getConfig } from './config';
import { S3, SQS } from 'aws-sdk';

export const withConnection = async <T>(cb: (client: S3, s3Options: ReturnType<typeof getConfig>, sqs: SQS) => Promise<T>) => {
    const config = getConfig();
    const s3 = new S3({ region: config.bucketRegion, signatureVersion: 'v4' });

    const sqs = new SQS({ region: config.bucketRegion });

    return await cb(s3, config, sqs);
};
