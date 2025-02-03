import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

export const loadJSON = (pathToFile: string): Record<string, any> => 
    JSON.parse(fs.readFileSync(path.resolve(pathToFile), 'utf-8'));

const mss: Record<string, string> = loadJSON('./settings/mysql.json');

export async function ConnectRunClose(query: string, params: any[] = []): Promise<any> {
    let connection: mysql.Connection | undefined;

    try {
        connection = await mysql.createConnection({
            host: mss.host,
            user: mss.user,
            database: mss.database,
            password: mss.password
        });

        const [results] = await connection.execute(query, params);
        console.log(`NEW SQL REQUEST: ${JSON.stringify({ sql: query, status: 200 })}`);
        if (Array.isArray(results) && results.length == 0) {
            return null;
        } else {
            return results;
        }
    } catch (err) {
        console.error(`SQL ERROR: ${err.message}`);
        return null;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

export async function encrypt(plainText: string) {
    bcrypt.hash(plainText, 7, function(err, hash) {
        if (err) console.error(err);
        return hash;
    });
}
