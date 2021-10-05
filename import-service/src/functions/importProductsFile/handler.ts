import 'source-map-support/register';

import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { withConnection } from 'src/util/withConnection';

export const importProductsFile: ValidatedEventAPIGatewayProxyEvent<{}> = async (event) => {
  try {
    const fileName = event.queryStringParameters.name;
    if (!fileName) {
      return formatJSONResponse(
        {
          message: 'Parameter "name" was not provided'
        },
        400
      );
    }

    const signedURL = await withConnection((client, options) => {
      return client.getSignedUrlPromise('putObject', {
        Bucket: options.bucketName,
        Key: `${options.uploadFolder}/${fileName}`,
        Expires: options.expration,
        ContentType: 'text/csv'
      });
    });

    return formatJSONResponse({signedURL}, 200);
  } catch (e) {
    return formatJSONResponse(
      {
        message: 'Error during creation of signed URL'
      },
      500
    );
  }
};

export const main = middyfy(importProductsFile);
