import "source-map-support/register";

import { withConnection } from "../../util/withConnection";
import { middyfy } from "@libs/lambda";
import { Handler, S3Event } from "aws-lambda";
import * as csv from "csv-parser";

const importFileParser: Handler<S3Event, { statusCode: number }> = async (
  event
) => {
  for (const record of event.Records) {
    await withConnection((client, options, sqs) => {
      const { key } = record.s3.object;
      const params = {
        Bucket: options.bucketName,
        Key: key,
      };

      const s3Stream = client.getObject(params).createReadStream();

      s3Stream
        .pipe(csv())
        .on("open", () => console.log(`Parsing began for file: ${key}`))
        .on("data", (data) => {
          console.log("sending data to queue", data);

          sqs.sendMessage(
            {
              QueueUrl: options.sqsURL,
              MessageBody: JSON.stringify(data),
            },
            (error, data) => {
              if (error) {
                console.error("error sending data", { error });
                return;
              }

              console.log("succ sending data!!!", { data });
            }
          );
        })
        .on("error", (error) => console.log("Parsing error occured:", error))
        .on("end", () => console.log(`Parsing finished for file: ${key}`));

      return Promise.resolve();
    });

    return {
      statusCode: 200,
    };
  }
};

export const main = middyfy(importFileParser);
