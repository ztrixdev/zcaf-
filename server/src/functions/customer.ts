import { QueryResult } from 'mysql2';
import { notify } from '../bot.ts';
import { ConnectRunClose, encrypt } from './misc.ts';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

export async function getCustomerByPhone(phone: Number): Promise<QueryResult | null> {
    try {
        const customer: QueryResult | null = await ConnectRunClose(`select * from customers where phone=?`, [phone]);
        return customer;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    try {
        const customer: QueryResult | null = await getCustomerByPhone(req.body.phone);
        if (customer == null) { res.sendStatus(404); } 
        else {
            const match: boolean = await bcrypt.compare(req.body.pwd, customer[0]['pwd']);
            if (match) {
                res.sendStatus(200);
            } else { res.sendStatus(400); }
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(409);
    }
}

export async function signUp(req: Request, res: Response): Promise<void> {
    const customer: QueryResult | null = await getCustomerByPhone(req.body.phone);
    if (customer == null) {                              
        if (req.body.name.length > 1 && req.body.phone > 10000000000 && req.body.pwd.length > 8)  {
            try {
                const enc_pwd = await encrypt(req.body.pwd);
                await ConnectRunClose(`insert into customers (name, phone, pwd) 
                    values (?, ?, ?)`, [req.body.name, req.body.phone, enc_pwd]);
                res.sendStatus(200);
            } catch (err) {
                console.error(err);
                res.sendStatus(409);
            }
        }
        else { res.sendStatus(401); }
    } else { res.sendStatus(400) };
} 



export async function modifyCustomer(req: Request, res: Response): Promise<void> {
    const customer: QueryResult | null = await getCustomerByPhone(req.body.phone);
    if (customer != null) {
        if (req.body.type == 'changePwd') {
            if (customer[0]['OTC'] == req.body.otc) {
                try {
                    await ConnectRunClose(`update customers set pwd=?, OTC=NULL where phone=?`, [await encrypt(req.body.newPwd), req.body.phone]);
                    await notify('pwd', '', customer[0]['telegram']);
                    res.sendStatus(200);
                } catch (err: any) {
                    console.error(err);
                    res.sendStatus(409);    
                }
            }
        }
        if (req.body.type == 'newOTC') {
            const oneTimeCode = Math.floor(Math.random() * (999999 - 100000) + 100000);
            try {
                await ConnectRunClose(`update customers set OTC=? where phone=?`, [oneTimeCode, req.body.phone]);
                await notify('otc', String(oneTimeCode), customer[0]['telegram']);
                res.sendStatus(200);
            } catch (err: any) {
                console.error(err);
                res.sendStatus(409);
            }
        } 
        else if (req.body.type == 'generic') {
            const match: boolean = await bcrypt.compare(req.body.pwd, customer[0]['pwd'])
            if (match) {
                const allowed: Array<string> = ['name', 'phone', 'telegram', 'orders', 'likes'];
                let sql_query: string = 'update customers set ';
                const changes_keys: Array<string> = Object.keys(req.body.changes || {});
                const params: Array<any> = [];
                
                changes_keys.forEach(key => {
                    if (allowed.includes(key)) {
                        sql_query += `${key}=?,`;
                        params.push(req.body.changes[key]);
                    }})
        
                sql_query = sql_query.slice(0, -1);
                sql_query += ' where phone=?';
                params.push(req.body.phone);
        
                try {
                    await ConnectRunClose(sql_query, params);
                    res.sendStatus(200);
                } catch (err: any) {
                    console.error(err);
                    res.sendStatus(409);
                }
            }
        }
    } else { res.sendStatus(404); }
}

