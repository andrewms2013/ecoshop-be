import 'source-map-support/register';

import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { withDbConnection } from 'src/database/withDbConnection';

const getItemList: ValidatedEventAPIGatewayProxyEvent<{}> = async () => {
  const { rows: shopItemsList } = await withDbConnection(client => {
    return client.query(
      'SELECT products.*, stocks.count FROM products LEFT JOIN stocks ON stocks.product_id = products.id'
    )
  });

  return formatJSONResponse({
    shopItemsList
  }, 200);
}

export const main = middyfy(getItemList);
