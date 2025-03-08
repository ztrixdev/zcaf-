import { QueryResult } from "mysql2";
import { ConnectRunClose, logRequest } from "./misc.ts";
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
    logRequest("GET", "/admin/Alogin", req.body);

    if (!req.body.token) {
        res.status(400).json({error: 'No token specified. Provide a valid admin token and try again.'})
    }

    try {
        const admin: QueryResult | null = await getAdminByToken(req.body.token);
        if (admin != null) { res.status(200).json({msg: 'Login successful! Proceed with your action.'});} 
        else { res.status(404).json({error: 'An Admin with the provided token was not found in the database.'}); }
    } catch (err: any) {
        console.error(err);
        res.status(409).json({error: 'An error occured while logging in.'});
    }
}

export async function genAdminToken(req: Request, res: Response): Promise<void> {
    logRequest("PUT", "/admin/genToken", req.body);

    if (!req.body.token) {
        res.status(400).json({error: 'No token specified. Provide a valid admin token and try again.'})
    }

    const admin: QueryResult | null = await getAdminByToken(req.body.token); 
    if (admin != null && admin[0]['role'] == 'head') {
        const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-=+?><|;:/[]{}`~';
        let result: string = '';
        for (let i = 0; i < 32; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        try {
            await ConnectRunClose(`insert into admins (role, token) values ("generic", ?)`, [result]);
            res.status(200).json({token: result});
        } catch (err: any) {
            console.error(err);
            res.status(409).json({error: 'An error occured while generating a new token'});
        }
    } else { res.status(401).json({error: 'The provided token does not belong to a Head Admin'}); }
}
