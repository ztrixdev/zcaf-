import { QueryResult } from 'mysql2';
import { notify } from '../bot.ts';
import { ConnectRunClose, encrypt, logRequest } from './misc.ts';
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
    logRequest("GET", "/customer/login", req.query);

    if (!req.query.phone || !req.query.pwd && isNaN(Number(req.query.phone))) {
        res.status(400).json({error: 'Check your credentials and try again.'});
    }

    try {
        const customer: QueryResult | null = await getCustomerByPhone(Number(req.query.phone));
        if (customer == null) { res.sendStatus(404); } 
        else {
            const match: boolean = await bcrypt.compare(req.query.pwd, customer[0]['pwd']);
            if (match) {
                res.status(200).json({msg: 'Login successful! Proceed with your action.'});
            } else { res.status(400).json({error: 'Check your credentials and try again.'}); }
        }
    } catch (err) {
        console.error(err);
        res.status(409).json({error: "An error occured while logging in."});
    }
}

export async function signUp(req: Request, res: Response): Promise<void> {
    logRequest("PUT", "/customer/signUp", req.body);

    if (!req.body.name || !req.body.phone || !req.body.pwd || isNaN(req.body.phone) || typeof(req.body.pwd) != "string") {
        res.status(400).json({error: 'Check your credentials and try again.'});
    } 

    const customer: QueryResult | null = await getCustomerByPhone(req.body.phone);
    if (customer == null) {                              
        if (req.body.name.length > 1 && req.body.phone > 10000000000 && req.body.pwd.length >= 8)  {
            try {
                const enc_pwd = await encrypt(req.body.pwd);
                await ConnectRunClose(`insert into customers (name, phone, pwd) 
                    values (?, ?, ?)`, [req.body.name, req.body.phone, enc_pwd]);
                res.status(200).json({msg: 'Signup successful! Proceed with your action.'});
            } catch (err) {
                console.error(err);
                res.status(409).json({error: 'An error occured while signing up!'});
            }
        } else { res.status(400).json({error: 'Check your credentials and try again.'}); }
    } else { res.status(401).json({error: 'A customer with these credentials already exists!'}); }
}   

export async function modifyCustomer(req: Request, res: Response): Promise<void> {
    logRequest("PATCH", "/customer/modify", req.body);

    if (!req.body.phone) {
        res.status(400).json({error: 'Provide a phone number and try again.'});
    } if (!req.body.type) {
        res.status(400).json({error: 'Provide an operation type and try again.'});
    }

    const customer: QueryResult | null = await getCustomerByPhone(req.body.phone);
    if (customer != null) {
        if (req.body.type == 'changePwd') {
            if (!req.body.otc) {
                res.status(400).json({error: 'Provide a valid One-Time-Code and try again.'});
            }

            if (customer[0]['OTC'] == req.body.otc) {
                if (req.body.newPwd) {
                    res.status(400).json({error: 'Provide a new password and try again.'});
                }
                
                if (req.body.newPwd.length >= 8) {
                    try {
                        await ConnectRunClose(`update customers set pwd=?, OTC=NULL where phone=?`, [await encrypt(req.body.newPwd), req.body.phone]);
                        await notify('pwd', '', customer[0]['telegram']);
                        res.status(200).json({msg: 'The password was changed successfuly!'});
                    } catch (err: any) {
                        console.error(err);
                        res.status(409).json({error: 'An error occured while changing the password.'});
                    }
                } else {
                    res.status(400).json({error: 'Your new password does not satisfy the length requirement.'});
                }
            }
        }
        if (req.body.type == 'newOTC') {
            const oneTimeCode = Math.floor(Math.random() * (999999 - 100000) + 100000);
            try {
                await ConnectRunClose(`update customers set OTC=? where phone=?`, [oneTimeCode, req.body.phone]);
                await notify('otc', String(oneTimeCode), customer[0]['telegram']);
                res.status(200).json({msg: 'A One-Time-Code was generated.'});
            } catch (err: any) {
                console.error(err);
                res.status(409).json({error: 'An error occured while generating a new One-Time-Code!'});
            }
        } 
        else if (req.body.type == 'general') {
            if (!req.body.pwd) {
                res.status(400).json({error: 'A password is required for general operations.'});
            } if (!req.body.changes) {
                res.status(400).json({error: 'No changes'});
            }

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
                    res.status(200).json({msg: 'The provided customer object was modified successfuly!'});
                } catch (err: any) {
                    console.error(err);
                    res.status(409).json({error: 'An error occured while modifying the customer object.'});
                }
            }
        }
    } else { res.status(404).json({error: 'A customer with the provided credentials was not found in the database.'}); }
}

