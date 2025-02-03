import { QueryResult } from "mysql2";
import { ConnectRunClose } from "./misc.ts";
import { Request, Response } from "express";

export async function getAdminByToken(token: String): Promise<QueryResult | null> {
    try {
        const admin: QueryResult | null = await ConnectRunClose(`select * from admins where token=?`, [token]);
        return admin;
    } catch (err: any) {
        console.error(err);
        return null;
    }
}

export async function Alogin(req: Request, res: Response): Promise<void> {
    try {
        const admin: QueryResult | null = await getAdminByToken(req.body.token);
        if (admin != null) { res.sendStatus(200); } 
        else { res.sendStatus(404); }
    } catch (err: any) {
        console.error(err);
        res.sendStatus(409);
    }
}

export async function genAdminToken(req: Request, res: Response): Promise<void> {
    const admin: QueryResult | null = await getAdminByToken(req.body.headtoken); 
    if (admin != null && admin[0]['role'] == 'head') {
        const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-=+?><|;:/[]{}`~';
        let result: string = '';
        for (let i = 0; i < 32; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        try {
            await ConnectRunClose(`insert into admins (role, token) values ("generic", ?)`, [result]);
            res.sendStatus(200);
        } catch (err: any) {
            console.error(err);
            res.sendStatus(409);
        }
    } else { res.sendStatus(401); }
}
