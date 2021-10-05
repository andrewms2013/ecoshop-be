import "source-map-support/register";

import { withDbConnection } from "./../../database/withDbConnection";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

const getItem: ValidatedEventAPIGatewayProxyEvent<{}> = async (event) => {
  const { id } = event.pathParameters;

  if (!id) {
    return formatJSONResponse(
      {
        message: 'Parameter "id" was not provided',
      },
      400
    );
  }

  const {
    rows: [item],
  } = await withDbConnection((client) => {
    return client.query(
      "SELECT products.*, stocks.count FROM products LEFT JOIN stocks ON stocks.product_id = products.id WHERE id = $1",
      [id]
    );
  });

  return item
    ? formatJSONResponse(
        {
          item,
        },
        200
      )
    : formatJSONResponse(
        {
          message: `Item with id "${id}" was not found`,
        },
        404
      );
};

export const main = middyfy(getItem);
