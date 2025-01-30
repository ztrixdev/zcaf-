import { getAdminByToken } from "./admin.js";
import { ConnectRunClose } from "./misc.js";

// this was copied from Stack Overflow lol
String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

export async function getDishByID(id) {
    try {
        const dish = await ConnectRunClose(`select * from dishes where id=${id}`);
        if (dish.length != 0) { return dish; }
        else { return null; }
    } catch (err) {
        console.error(err);
        return 0;
    }
}

/* 
CODE: DESCRIPTION
______________________________________________________________________
200: OK, the provided dish was added to the database;
401: Unathorized, check your admin token and try again;
409: Internal Server Problems;
*/
export async function newDishEntry(req, res) {
    const admin = await getAdminByToken(req.body.token);
    if (admin != null) {
        try {
            await ConnectRunClose(`insert into dishes (name, price, description, images, recommended, nutrition)
                values ('${JSON.stringify(req.body.name)}',
                 ${req.body.price}, 
                 '${JSON.stringify(req.body.description)}',
                 '[${req.body.images}]', ${req.body.recommended},
                '${JSON.stringify(req.body.nutrition)}')`);
            res.sendStatus(200);
        } catch (err) {
            console.error(err);
            res.sendStatus(409);
        }
    } else { res.sendStatus(401); }
}

/* 
CODE: DESCRIPTION
______________________________________________________________________
200: OK, the provided dish has been modified;
401: Unathorized, check your admin token and try again;
404: The provided dish hasn't been found in the database;
409: Internal Server Problems;
*/
export async function modifyDish(req, res) {
    const admin = await getAdminByToken(req.body.token);
    if (admin != null) {
        if ((await getDishByID(req.body.id)) != null) {
            var allowed = ['type', 'name', 'price', 'description', 'images', 'recommended', 'nutrition'];
            var sql_query = 'update dishes set ';
            var changes_keys = Object.keys(req.body.changes);
            for (var i = 0; i < changes_keys.length; i++) {
                if (!allowed.includes(changes_keys[i])) {
                    continue;
                } else {
                    if (typeof(req.body.changes[changes_keys[i]]) == 'string') {
                        sql_query += `${changes_keys[i]}="${req.body.changes[changes_keys[i]]}",`;
                    } if (typeof(req.body.changes[changes_keys[i]]) == 'number') {
                        sql_query += `${changes_keys[i]}=${req.body.changes[changes_keys[i]]},`;
                    }
                }
            }
            var finite = `where id=${req.body.id}`;
            sql_query += finite;
            var fin_sql = sql_query.replaceAt(sql_query.search(finite)-1, ' ');
            try {
                await ConnectRunClose(fin_sql);
                res.sendStatus(200);
            } catch (err) {
                console.error(err);
                res.sendStatus(409);
            }
            } else { res.sendStatus(404); }
        } else { res.sendStatus(401); } }


/* 
CODE: DESCRIPTION
______________________________________________________________________
200: OK, the provided dish has been deleted from the database;
401: Unathorized, check your admin token and try again;
404: The provided dish hasn't been found in the database;
409: Internal Server Problems;
*/
export async function removeDish(req, res) {
    const admin = await getAdminByToken(req.body.token);
    if (admin != null) {
        if (await getDishByID(req.body.id) != null) {
            try {
                await ConnectRunClose(`delete from dishes where id=${req.body.id}`);
                res.sendStatus(200);
            } catch (err) {
                console.error(err);
                res.sendStatus(409);
            }
        } else { res.sendStatus(404); }
    } else { res.sendStatus(401); }
}


