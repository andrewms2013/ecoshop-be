import "source-map-support/register";

import { withDbConnection } from "src/database/withDbConnection";
import { ShopItem } from "./../../database/models/shopItem";
import { SQSHandler } from "aws-lambda/trigger/sqs";
import { SNS } from "aws-sdk";
import { middyfy } from "@libs/lambda";

async function sendEmail(Subject: string, Message: string) {
  try {
    const sns = new SNS({ region: process.env.SNS_REGION });

    console.log(process.env.SNS_ARN);
    await sns
      .publish({
        Subject,
        Message,
        TargetArn: process.env.SNS_ARN,
      })
      .promise();

    console.log("Email sent successfully");
  } catch (error) {
    console.error("An error occured during sending an email");
    console.error(error);

    throw error;
  }
}

export const catalogBatchProcess: SQSHandler = async (event) => {
  try {
    const parsedProducts: Omit<ShopItem, "id">[] = event.Records.map(
      ({ body }) => JSON.parse(body)
    );

    for (const product of parsedProducts) {
      await withDbConnection(async (client) => {
        try {
          await client.query("BEGIN");

          const {
            rows: [insertedProduct],
          } = await client.query(
            "INSERT INTO products(name, description, price, picture) VALUES($1, $2, $3, $4) RETURNING id",
            [product.name, product.description, product.price, product.picture]
          );

          await client.query(
            "INSERT INTO stocks(product_id, count) VALUES ($1, $2)",
            [insertedProduct.id, product.count]
          );

          await client.query("COMMIT");

          console.log(
            `Product with name ${product.name} was imported under id ${insertedProduct.id}`
          );
        } catch (error) {
          await client.query("ROLLBACK");

          console.error(
            `Product with name ${product.name} was not imported because of an error`
          );
          console.error(error);

          throw error;
        }
      });
    }

    await sendEmail(
      "Successful import",
      `Product import was successfuly finished, number of imported products: ${parsedProducts.length}`
    );
  } catch (error) {
    console.error("Unsuccessful import");
  }
};

export const main = middyfy(catalogBatchProcess);
