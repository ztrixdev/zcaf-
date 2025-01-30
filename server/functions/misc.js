import mysql from 'mysql2';
import fs from 'fs';

export const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
const mss = loadJSON('../settings/mysql.json');

export async function ConnectRunClose(sqline) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: `${mss.host}`,
            user: `${mss.user}`,
            database: `${mss.database}`,
            password: `${mss.password}`
        });

        connection.connect((err) => {
            if (err) { reject(err); return; }
        });

        connection.query(sqline, (err, res) => {
            if (err) { reject(err); return; }

            const qres = res;
            connection.end((err) => {
                if (err) { reject(err); return; }
                console.log(`NEW SQL REQUEST: ${JSON.stringify({'sql': sqline, 'status': 200})}`);
                resolve(qres); 
            });
        });
    });
}
