import { QueryResult } from "mysql2";
import { getAdminByToken } from "./admin.ts";
import { ConnectRunClose, logRequest } from "./misc.ts";

import { Request, Response } from "express";

export async function getDishByID(id: Number): Promise<QueryResult | null> {
    try {
        const dish: QueryResult | null = await ConnectRunClose(`select * from dishes where id=${id}`);
        return dish;
    } catch (err: any) {
        console.error(err);
        return null;
    }
}

export async function newDishEntry(req: Request, res: Response): Promise<void> {
    logRequest("PUT", "/dish/newEntry", req.body);

    if (!req.body.token) {
        res.status(400).json({error: 'No token specified. Provide a valid admin token and try again.'});
    }

    const admin: QueryResult | any = await getAdminByToken(req.body.token);
    if (admin != null) {
        try {
            await ConnectRunClose(`insert into dishes (type, name, price, description, images, recommended, nutrition)
                values (?, ?, ?, ?, ?, ?, ?)`, [`${req.body.type}`, `${JSON.stringify(req.body.name)}`, req.body.price, `${JSON.stringify(req.body.description)}`,
                    `[${req.body.images}]`, req.body.recommended, `${JSON.stringify(req.body.nutrition)}`]);
            res.status(200).json({msg: 'A new dish object was created in the database!'});
        } catch (err: any) {
            console.error(err);
            res.status(409).json({error: 'An error occured while creating a new dish object in the database!'});
        }
    } else { res.status(401).json({error: "Check your admin token and try again."}); }
}

export async function modifyDish(req: Request, res: Response): Promise<void> {
    logRequest("PATCH", "/dish/modify", req.body);

    if (!req.body.token) {
        res.status(400).json('No token specified. Provide a valid admin token and try again.');
    } if (!req.body.id) {
        res.status(400).json('No ID specified. Provide a valid dish ID and try again.');
    }

    const admin: QueryResult | null = await getAdminByToken(req.body.token);
    const dish: QueryResult | null = await getDishByID(req.body.id);
    if (admin != null) {
        if (dish != null) {
            if (!req.body.changes) {
                res.status(400).json('No changes.');
            }

            const allowed: Array<string> = ['type', 'name', 'price', 'description', 'recommended', 'nutrition'];
            let sql_query: string = 'update dishes set ';
            let params: Array<string> = [];
    
            const changes_keys: Array<string> = Object.keys(req.body.changes || {});
            changes_keys.forEach(key => {
                if (allowed.includes(key)) {
                    sql_query += `${key}=?,`;
                    params.push(req.body.changes[key]);
                }
            }); 
    
            sql_query = sql_query.slice(0, -1);
            sql_query += ' where id=?';
            params.push(req.body.id);
    
            try {
                await ConnectRunClose(sql_query, params);
                res.send(200).json({msg: 'The dish was modified successfuly!'});
            } catch (err: any) {
                console.error(err);
                res.status(409).json({error: 'An error occured while modifying the dish!'});
            }
        } else { res.status(404).json({error: 'A dish with the provided ID was not found.'}); }
    } else { res.status(401).json({error: 'Check your admin token and try again.'}); }
}

export async function removeDish(req: Request, res: Response): Promise<void> {
    logRequest("DELETE", "/dish/remove", req.body);

    if (!req.body.token) {
        res.status(400).json('No token specified. Provide a valid admin token and try again.');
    } if (!req.body.id) {
        res.status(400).json('No ID specified. Provide a valid dish ID and try again.');
    }

    const admin: QueryResult | null = await getAdminByToken(req.body.token);
    const dish: QueryResult | null = await getDishByID(req.body.id);
    if (admin != null) {
        if (dish!= null) {
            try {
                await ConnectRunClose(`delete from dishes where id=?`, [req.body.id]);
                await ConnectRunClose(`delete from images where id=?`, [req.body.id]);
                res.status(200).json({msg: 'The dish was removed successfuly!'});
            } catch (err) {
                console.error(err);
                res.status(409).json({error: 'An error occured while deleting the dish!'});
            }
        } else { res.status(404).json({error: 'A dish with the provided ID was not found in the database.'}); }
    } else { res.status(401).json({error: 'Check your admin token and try again.'}); }
}

export async function loadDishes(req: Request, res: Response): Promise<void> {
    logRequest('GET', 'dish/load', req.body);

    try {
        res.send(await ConnectRunClose('select * from dishes', []));
    } catch (err: any) {
        res.send(err);
    }
}

