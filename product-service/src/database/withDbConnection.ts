import { Client } from 'pg';
import { getDatabaseConfig } from './config';

export const withDbConnection = async <T>(cb: (client: Client) => Promise<T>) => {
    const client = new Client(getDatabaseConfig());

    try {
        await client.connect();

        return await cb(client);
    } finally {
        await client.end();
    }
}
