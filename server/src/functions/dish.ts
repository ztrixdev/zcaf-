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
    logRequest("POST", "/dish/newDishEntry", req.body);
    const admin: QueryResult | any = await getAdminByToken(req.body.token);
    if (admin != null) {
        try {
            await ConnectRunClose(`insert into dishes (type, name, price, description, images, recommended, nutrition)
                values (?, ?, ?, ?, ?, ?, ?)`, [`${req.body.type}`, `${JSON.stringify(req.body.name)}`, req.body.price, `${JSON.stringify(req.body.description)}`,
                    `[${req.body.images}]`, req.body.recommended, `${JSON.stringify(req.body.nutrition)}`]);
            res.sendStatus(200);
        } catch (err: any) {
            console.error(err);
            res.sendStatus(409);
        }
    } else { res.sendStatus(401); }
}

export async function modifyDish(req: Request, res: Response): Promise<void> {
    logRequest("PATCH", "/dish/modifyDish", req.body);
    const admin: QueryResult | null = await getAdminByToken(req.body.token);
    const dish: QueryResult | null = await getDishByID(req.body.id);
    if (admin != null) {
        if (dish != null) {
            const allowed: Array<string> = ['type', 'name', 'price', 'description', 'images', 'recommended', 'nutrition'];
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
                res.sendStatus(200);
            } catch (err: any) {
                console.error(err);
                res.sendStatus(409);
            }
        } else { res.sendStatus(404); }
    } else { res.sendStatus(401); }
}

export async function removeDish(req: Request, res: Response) {
    logRequest("DELETE", "/dish/removeDish", req.body);
    const admin: QueryResult | null = await getAdminByToken(req.body.token);
    const dish: QueryResult | null = await getDishByID(req.body.id);
    if (admin != null) {
        if (dish!= null) {
            try {
                await ConnectRunClose(`delete from dishes where id=?`, [req.body.id]);
                res.sendStatus(200);
            } catch (err) {
                console.error(err);
                res.sendStatus(409);
            }
        } else { res.sendStatus(404); }
    } else { res.sendStatus(401); }
}


